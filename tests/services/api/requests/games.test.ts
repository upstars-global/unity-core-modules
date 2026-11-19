import { beforeEach, describe, expect, it, vi } from "vitest";

const { getMock, postMock, putMock, deleteMock, httpMock, logError } = vi.hoisted(() => ({
    getMock: vi.fn(),
    postMock: vi.fn(),
    putMock: vi.fn(),
    deleteMock: vi.fn(),
    httpMock: vi.fn(),
    logError: vi.fn(),
}));

vi.mock("../../../../src/services/api/http", () => ({ http: httpMock }));
vi.mock("../../../../src/controllers/Logger", () => ({ log: { error: logError } }));

import { AcceptsGamesVariants } from "../../../../src/services/api/DTO/gamesDTO";
import {
    fetchAddFavoriteGamesCount,
    fetchDeleteGameFromFavorites,
    fetchFavoriteGames,
    loadCategoriesFileConfigRequest,
    loadFilteredGames,
    loadGameBySeoTitleReq,
    loadGameBySlugReq,
    loadGamesByIdsReq,
    loadGamesCategories,
    loadGamesCategoryReq,
    loadGamesDataByFilter,
    loadGamesJackpots,
    loadGamesProvidersReq,
    loadLastGames,
    loadRandomGame,
} from "../../../../src/services/api/requests/games";

beforeEach(() => {
    vi.resetAllMocks();
    httpMock.mockReturnValue({ get: getMock, post: postMock, put: putMock, delete: deleteMock });
});

describe("games GET requests", () => {
    it.each([
        { name: "jackpots", run: loadGamesJackpots, url: "/api/games/jackpots", data: { USD: { provider: 100 } }, fallback: {}, errorLabel: "LOAD_GAMES_JACKPOTS_ERROR" },
        { name: "played games", run: loadLastGames, url: "/api/player/played_games", data: [{ identifier: "game", last_activity_at: null }], fallback: [], errorLabel: "LOAD_LAST_GAMES_ERROR" },
        { name: "game categories", run: loadGamesCategories, url: "/api/games/collections", data: [{ id: "slots", title: "Slots", games_count: 2 }], fallback: [], errorLabel: "LOAD_GAMES_CATEGORIES_ERROR" },
    ])("returns $name data and handles request failures", async ({ run, url, data, fallback, errorLabel }) => {
        getMock.mockResolvedValueOnce({ data });

        await expect(run()).resolves.toEqual(data);
        expect(getMock).toHaveBeenCalledWith(url);

        const error = new Error("network");
        getMock.mockRejectedValueOnce(error);

        await expect(run()).resolves.toEqual(fallback);
        expect(logError).toHaveBeenCalledWith(errorLabel, error);
    });

    it("encodes the random game identifier and omits absent parameters", async () => {
        const game = { id: 1 };
        getMock.mockResolvedValue({ data: game });

        await expect(loadRandomGame({ identifier: "live & slots" })).resolves.toEqual(game);
        expect(getMock).toHaveBeenLastCalledWith("/api/games/random?identifier=live%20%26%20slots");

        await loadRandomGame({});
        expect(getMock).toHaveBeenLastCalledWith("/api/games/random");

        await loadRandomGame({ identifier: undefined });
        expect(getMock).toHaveBeenLastCalledWith("/api/games/random");
    });

    it("returns an empty game and logs random game failures", async () => {
        const error = new Error("network");
        getMock.mockRejectedValueOnce(error);

        await expect(loadRandomGame({ identifier: "game" })).resolves.toEqual({});
        expect(logError).toHaveBeenCalledWith("LOAD_RANDOM_GAME_ERROR", error);
    });
});

describe("game filter requests", () => {
    const config = { device: "mobile", filter: { providers: [ "provider" ] } };

    it.each([
        { name: "selected games", run: () => loadFilteredGames(config), url: "/api/games_filter/select", data: [{ id: 1 }], fallback: [], errorLabel: "LOAD_FILTERED_GAMES_ERROR" },
        { name: "category filter", run: () => loadGamesCategoryReq(config), url: "/api/games_filter", data: { total: 2 }, fallback: {}, errorLabel: "LOAD_GAMES_CATEGORY_ERROR" },
        { name: "generic filter", run: () => loadGamesDataByFilter<{ total: number }>(config), url: "/api/games_filter", data: { total: 2 }, fallback: {}, errorLabel: "LOAD_GAMES_DATA_BY_FILTER_ERROR" },
    ])("returns $name data and handles request failures", async ({ run, url, data, fallback, errorLabel }) => {
        postMock.mockResolvedValueOnce({ data });

        await expect(run()).resolves.toEqual(data);
        expect(postMock).toHaveBeenCalledWith(url, config);

        const error = new Error("network");
        postMock.mockRejectedValueOnce(error);

        await expect(run()).resolves.toEqual(fallback);
        expect(logError).toHaveBeenCalledWith(errorLabel, error);
    });

    it("requests games by SEO title with territorial restriction disabled by default", async () => {
        const games = { game: { id: 1 } };
        postMock.mockResolvedValueOnce({ data: games });

        await expect(loadGameBySeoTitleReq("game")).resolves.toEqual(games);
        expect(postMock).toHaveBeenCalledWith("/api/games_filter/select_by_seo_titles", {
            without_territorial_restrictions: false,
            game_seo_titles: [ "game" ],
        });
    });

    it("passes the explicit territorial restriction flag", async () => {
        postMock.mockResolvedValueOnce({ data: {} });

        await loadGameBySeoTitleReq("game", true);

        expect(postMock).toHaveBeenCalledWith("/api/games_filter/select_by_seo_titles", {
            without_territorial_restrictions: true,
            game_seo_titles: [ "game" ],
        });
    });

    it("requests games by IDs and device", async () => {
        const games = { game: { id: 1 } };
        postMock.mockResolvedValueOnce({ data: games });

        await expect(loadGamesByIdsReq([ "game" ], "mobile")).resolves.toEqual(games);
        expect(postMock).toHaveBeenCalledWith("/api/games_filter/select", {
            device: "mobile",
            game_ids: [ "game" ],
        });
    });

    it("requests a game by slug", async () => {
        const games = { game: { id: 1 } };
        postMock.mockResolvedValueOnce({ data: games });

        await expect(loadGameBySlugReq("game")).resolves.toEqual(games);
        expect(postMock).toHaveBeenCalledWith("/api/games_filter/select", { game_ids: [ "game" ] });
    });

    it.each([
        { name: "SEO title", run: () => loadGameBySeoTitleReq("game"), errorLabel: "LOAD_GAME_BY_SEO_TITLE_ERROR" },
        { name: "IDs", run: () => loadGamesByIdsReq([ "game" ], "mobile"), errorLabel: "LOAD_GAMES_BY_IDS_ERROR" },
        { name: "slug", run: () => loadGameBySlugReq("game"), errorLabel: "LOAD_GAME_BY_SLUG_ERROR" },
    ])("logs and rethrows $name request failures", async ({ run, errorLabel }) => {
        const error = new Error("network");
        postMock.mockRejectedValueOnce(error);

        await expect(run()).rejects.toBe(error);
        expect(logError).toHaveBeenCalledWith(errorLabel, error);
    });
});

describe("game provider requests", () => {
    it("loads all providers when the filter is omitted", async () => {
        const providers = [{ identifier: "provider" }];
        getMock.mockResolvedValueOnce({ data: providers });

        await expect(loadGamesProvidersReq()).resolves.toEqual(providers);
        expect(getMock).toHaveBeenCalledWith("/api/games/providers");
    });

    it("adds each category identifier as a separate query parameter", async () => {
        getMock.mockResolvedValueOnce({ data: [] });

        await loadGamesProvidersReq({ category_identifiers: [ "live", "slots" ], device: "mobile" });

        const [ url ] = getMock.mock.calls[0];
        const params = new URLSearchParams(url.split("?")[1]);
        expect(params.getAll("category_identifiers[]")).toEqual([ "live", "slots" ]);
        expect(params.get("device")).toBe("mobile");
    });

    it("filters provider game counts by device without categories", async () => {
        getMock.mockResolvedValueOnce({ data: [] });

        await loadGamesProvidersReq({ device: "desktop" });

        expect(getMock).toHaveBeenLastCalledWith("/api/games/providers?device=desktop");
    });

    it("loads all providers when category identifiers are omitted or empty", async () => {
        getMock.mockResolvedValue({ data: [] });

        await loadGamesProvidersReq({});
        await loadGamesProvidersReq({ category_identifiers: [] });

        expect(getMock).toHaveBeenNthCalledWith(1, "/api/games/providers");
        expect(getMock).toHaveBeenNthCalledWith(2, "/api/games/providers");
    });

    it("returns an empty list and logs request failures", async () => {
        const error = new Error("network");
        getMock.mockRejectedValueOnce(error);

        await expect(loadGamesProvidersReq({ device: "mobile" })).resolves.toEqual([]);
        expect(logError).toHaveBeenCalledWith("LOAD_GAMES_PROVIDERS_ERROR", error);
    });
});

describe("category config request", () => {
    it("returns category config", async () => {
        const config = { menu: [ "slots" ] };
        getMock.mockResolvedValueOnce({ data: config });

        await expect(loadCategoriesFileConfigRequest()).resolves.toEqual(config);
        expect(getMock).toHaveBeenCalledWith("/api-fe/config/menu-categories-games");
    });

    it("logs and rethrows request failures", async () => {
        const error = new Error("network");
        getMock.mockRejectedValueOnce(error);

        await expect(loadCategoriesFileConfigRequest()).rejects.toBe(error);
        expect(logError).toHaveBeenCalledWith("LOAD_CATEGORIES_PAGE_FILE_CONFIG_ERROR", error);
    });
});

describe("favorite game requests", () => {
    it("sets the requested response version header and returns favorite games", async () => {
        const games = [ 1, 2 ];
        getMock.mockResolvedValueOnce({ data: games });

        await expect(fetchFavoriteGames(AcceptsGamesVariants.onlyID)).resolves.toEqual(games);
        expect(httpMock).toHaveBeenCalledWith({ headers: { "accept-client": AcceptsGamesVariants.onlyID } });
        expect(getMock).toHaveBeenCalledWith("/api/player/favorite_games");
    });

    it("logs and rethrows favorite game loading failures", async () => {
        const error = new Error("network");
        getMock.mockRejectedValueOnce(error);

        await expect(fetchFavoriteGames(AcceptsGamesVariants.fullData)).rejects.toBe(error);
        expect(logError).toHaveBeenCalledWith("FETCH_FAVORITE_GAMES_ERROR", error);
    });

    it("adds a favorite game with authentication", async () => {
        const response = { data: { added: true } };
        putMock.mockResolvedValueOnce(response);

        await expect(fetchAddFavoriteGamesCount(42)).resolves.toBe(response);
        expect(httpMock).toHaveBeenCalledWith({ auth: true });
        expect(putMock).toHaveBeenCalledWith("/api/player/favorite_games/42");
    });

    it("logs add failures and returns undefined", async () => {
        const error = new Error("network");
        putMock.mockRejectedValueOnce(error);

        await expect(fetchAddFavoriteGamesCount(42)).resolves.toBeUndefined();
        expect(logError).toHaveBeenCalledWith("FETCH_FAVORITE_GAMES_COUNT_ERROR", error);
    });

    it("deletes a favorite game with authentication", async () => {
        const response = { data: { deleted: true } };
        deleteMock.mockResolvedValueOnce(response);

        await expect(fetchDeleteGameFromFavorites(42)).resolves.toBe(response);
        expect(httpMock).toHaveBeenCalledWith({ auth: true });
        expect(deleteMock).toHaveBeenCalledWith("/api/player/favorite_games/42");
    });

    it("logs delete failures and returns undefined", async () => {
        const error = new Error("network");
        deleteMock.mockRejectedValueOnce(error);

        await expect(fetchDeleteGameFromFavorites(42)).resolves.toBeUndefined();
        expect(logError).toHaveBeenCalledWith("FETCH_DELETE_GAME_FROM_FAVORITES_ERROR", error);
    });
});
