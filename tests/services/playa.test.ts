import { beforeEach, describe, expect, it, vi } from "vitest";

import { log } from "../../src/controllers/Logger";
import type { IGameItemFilter } from "../../src/helpers/gameHelpers";
import { GameDisableGeoStatus } from "../../src/models/game";
import { loadPlayaFallbackPage, loadPlayaPage } from "../../src/services/playa";
import { useCommon } from "../../src/store/common";
import { useConfigStore } from "../../src/store/configStore";
import { useGamesCategory } from "../../src/store/games/gamesCategory";
import { useGamesProviders } from "../../src/store/games/gamesProviders";
import { useGamesCommon } from "../../src/store/games/gamesStore";
import { useMultilangStore } from "../../src/store/multilang";
import { useRootStore } from "../../src/store/root";

const { get, post } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));

vi.mock("../../src/services/api/http", () => ({ http: () => ({ get, post }) }));
vi.mock("../../src/controllers/Logger", () => ({ log: { error: vi.fn() } }));

function catalogueGame(identifier: string): IGameItemFilter {
    return {
        identifier,
        title: `Title ${ identifier }`,
        provider: "studio",
        seo_title: identifier.split("/")[1],
        uniq_seo_title: true,
        categories: [ "top:au" ],
        currencies: { AUD: { id: 123 }, FUN: { id: 456 } },
        devices: [ "desktop", "mobile" ] as IGameItemFilter["devices"],
        lines: null,
        ways: 20,
        volatility_rating: "medium",
        hit_rate: "25",
        payout: "96",
        unfinished_games_for: [],
    };
}

beforeEach(() => {
    vi.resetAllMocks();
    useConfigStore().$defaultProjectConfig.featureFlags.enableAllProviders = false;
    useCommon().$patch({ currentIpInfo: { country_code: "AU" } });
    useMultilangStore().geo = "AU";
    useGamesCommon().$patch({ gamesCategories: [ { id: "top:au" } ] });
});

describe("loadPlayaPage", () => {
    it.each([ false, true ])("preserves Playa order and catalogue metadata for mobile=%s", async (isMobile) => {
        useRootStore().$patch({ platform: { isMobile } });
        get.mockResolvedValue({ data: {
            gameIds: [ "studio/second", "studio/missing", "studio/first" ],
            pagination: { page: 1, limit: 3, total: 7 },
        } });
        post.mockResolvedValue({ data: {
            "studio/first": catalogueGame("studio/first"),
            "studio/second": catalogueGame("studio/second"),
        } });

        const result = await loadPlayaPage(1, 3);

        expect(get).toHaveBeenCalledExactlyOnceWith("/api-fe/playa/recommendations", { params: { page: 1, limit: 3 } });
        expect(post).toHaveBeenCalledExactlyOnceWith("/api/games_filter/select", {
            device: isMobile ? "mobile" : "desktop",
            game_ids: [ "studio/second", "studio/missing", "studio/first" ],
        });
        expect(result?.nextPage).toBe(2);
        expect(result?.games.map(game => game.identifier)).toEqual([ "studio/second", "studio/first" ]);
        expect(result?.games[0]).toMatchObject({
            id: "second",
            name: "Title studio/second",
            provider: "studio",
            slug: "studio/second",
            gameSlug: "studio/second",
            preview: "/some-bucket/i/s3/studio/second.png",
            collections: { "top:au": 1 },
            badges: [ { type: "top" } ],
            real: { AUD: 123, FUN: 456 },
            demo: 456,
            has_demo_mode: true,
        });
        expect(useGamesCategory().collections).toEqual({});
    });

    it("filters geo restrictions, disabled providers and CMS rules without losing the next page", async () => {
        useGamesProviders().setDisabledGamesProviders({
            disabled: GameDisableGeoStatus.all,
            blockedInAu: [ "AU" ],
            allowedInAu: [ "CA" ],
        });
        useGamesCommon().setEnableGamesConfig({ "studio/allowed": [ "AU" ], "studio/cms-blocked": [ "CA" ] });
        const cards = {
            "studio/geo-blocked": { ...catalogueGame("studio/geo-blocked"), is_geo_available: false },
            "studio/provider-disabled": { ...catalogueGame("studio/provider-disabled"), provider: "disabled" },
            "studio/provider-au": { ...catalogueGame("studio/provider-au"), provider: "blockedInAu" },
            "studio/cms-blocked": catalogueGame("studio/cms-blocked"),
            "studio/allowed": { ...catalogueGame("studio/allowed"), provider: "allowedInAu" },
        };
        get.mockResolvedValue({ data: { gameIds: Object.keys(cards), pagination: { page: 1, limit: 5, total: 10 } } });
        post.mockResolvedValue({ data: cards });

        const result = await loadPlayaPage(1, 5);

        expect(result?.games.map(game => game.identifier)).toEqual([ "studio/allowed" ]);
        expect(result?.nextPage).toBe(2);
    });

    it("returns an empty filtered page for the caller to select fallback", async () => {
        useGamesProviders().setDisabledGamesProviders({ studio: GameDisableGeoStatus.all });
        get.mockResolvedValue({ data: { gameIds: [ "studio/blocked" ], pagination: { page: 1, limit: 1, total: 2 } } });
        post.mockResolvedValue({ data: { "studio/blocked": catalogueGame("studio/blocked") } });

        await expect(loadPlayaPage(1, 1)).resolves.toEqual({ games: [], nextPage: 2 });
        expect(post).toHaveBeenCalledTimes(1);
    });

    it("does not request catalogue cards for an empty final page", async () => {
        get.mockResolvedValue({ data: { gameIds: [], pagination: { page: 2, limit: 20, total: 20 } } });

        await expect(loadPlayaPage(2, 20)).resolves.toEqual({ games: [], nextPage: null });
        expect(post).not.toHaveBeenCalled();
    });

    it.each([ "recommendations", "catalogue" ])("returns no page when the %s request fails", async (request) => {
        const error = new Error("unavailable");
        if (request === "recommendations") {
            get.mockRejectedValue(error);
        } else {
            get.mockResolvedValue({ data: { gameIds: [ "studio/game" ], pagination: { page: 1, limit: 20, total: 1 } } });
            post.mockRejectedValue(error);
        }

        await expect(loadPlayaPage(1, 20)).resolves.toBeUndefined();
        expect(log.error).toHaveBeenCalledWith("LOAD_PLAYA_TOP_ERROR", error);
        expect(post).toHaveBeenCalledTimes(request === "catalogue" ? 1 : 0);
    });
});

describe("loadPlayaFallbackPage", () => {
    it("loads the geo category with catalogue metadata, CMS filtering and backend pagination", async () => {
        useGamesProviders().setDisabledGamesProviders({ disabled: GameDisableGeoStatus.all });
        useGamesCommon().setEnableGamesConfig({ "studio/cms-blocked": [ "CA" ] });
        post.mockResolvedValue({ data: {
            data: [
                catalogueGame("studio/first"),
                { ...catalogueGame("studio/provider-blocked"), provider: "disabled" },
                catalogueGame("studio/cms-blocked"),
                catalogueGame("studio/second"),
            ],
            pagination: { next_page: 3 },
        } });

        const result = await loadPlayaFallbackPage("top", 2, 25);

        expect(post).toHaveBeenCalledExactlyOnceWith("/api/games_filter", {
            device: "desktop",
            filter: { categories: { identifiers: [ "top:au" ], strategy: "OR" } },
            page: 2,
            page_size: 25,
        });
        expect(result?.games.map(game => game.identifier)).toEqual([ "studio/first", "studio/second" ]);
        expect(result?.games[0]).toMatchObject({ name: "Title studio/first", preview: "/some-bucket/i/s3/studio/first.png" });
        expect(result?.nextPage).toBe(3);
        expect(get).not.toHaveBeenCalled();
        expect(useGamesCategory().collections).toEqual({});
    });

    it("preserves an empty final catalogue page", async () => {
        post.mockResolvedValue({ data: { data: [], pagination: { next_page: null } } });

        await expect(loadPlayaFallbackPage("top", 1, 20)).resolves.toEqual({ games: [], nextPage: null });
    });

    it("returns no page when the fallback request fails", async () => {
        const error = new Error("unavailable");
        post.mockRejectedValue(error);

        await expect(loadPlayaFallbackPage("top", 1, 20)).resolves.toBeUndefined();
        expect(log.error).toHaveBeenCalledWith("LOAD_GAMES_DATA_BY_FILTER_ERROR", error);
        expect(get).not.toHaveBeenCalled();
    });
});
