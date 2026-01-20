import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

import {
    loadFilteredGames as loadFilteredGamesReq,
    loadGamesCategories as loadGamesCategoriesReq,
    loadGamesJackpots as loadGamesJackpotsReq,
    loadLastGames as loadLastGamesReq } from "../../../src/services/api/requests/games";
import { useGamesCommon } from "../../../src/store/games/gamesStore";
vi.mock("../../../src/services/api/requests/games", () => ({
    loadGamesCategories: vi.fn(),
    loadGamesJackpots: vi.fn(),
    loadLastGames: vi.fn(),
    loadFilteredGames: vi.fn(),
}));

vi.mock("../../../src/helpers/currencyHelper", () => ({
    currencyView: vi.fn((amount) => `formatted-${amount}`),
}));

vi.mock("../../../src/helpers/gameHelpers", () => ({
    processGame: vi.fn((game, id) => ({ ...game, processed: true, id })),
}));

vi.mock("../../../src/store/user/userInfo", () => ({
    useUserInfo: vi.fn(() => ({
        getUserCurrency: ref("USD"),
        getSubunitsToUnitsByCode: () => 100,
    })),
}));

vi.mock("../../../src/store/root", () => ({
    useRootStore: vi.fn(() => ({
        isMobile: ref(false),
    })),
}));
vi.mock("../../../src/controllers/Logger", () => ({
    log: {
        info: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock("../../../src/store/configStore", () => ({
    useConfigStore: () => ({
        gamesPageLimit: ref(20),
        $defaultProjectConfig: {
            SPECIAL_GAME_PROVIDER_NAME: "special_provider",
            CONFIG_DEFAULT_COLLECTIONS_MENU_SLUGS:[],
            featureFlags:{
                enableAllProviders: true },
        },
    }),
}));

describe("useGamesCommon", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    it("should initialize with default values", () => {
        const store = useGamesCommon();

        expect(store.gamesDataCached).toEqual({});
        expect(store.games).toEqual([]);
        expect(store.gamesCategories).toEqual([]);
        expect(store.recentGames).toEqual({});
        expect(store.gamesJackpots).toEqual({});
        expect(store.menuGameCategories).toEqual({});
    });

    it("should set default menu game categories", () => {
        const store = useGamesCommon();
        const defaultCategories = { key1: [ "cat1", "cat2" ], key2: [ "cat3" ] };

        store.setDefaultOptions({ defaultMenuGameCategories: defaultCategories });

        expect(store.defaultMenuGameCategories).toEqual(defaultCategories);
    });

    it("should load game categories", async () => {
        loadGamesCategoriesReq.mockResolvedValue([
            { id: "slot", title: "Slots" },
            { id: "poker", title: "Poker" },
        ]);

        const store = useGamesCommon();
        await store.loadGamesCategories();

        expect(store.gamesCategories).toEqual([
            { slug: "slot", provider: "slot", url: "/games/slot", name: "Slots", id: "slot", title: "Slots" },
            { slug: "poker", provider: "poker", url: "/games/poker", name: "Poker", id: "poker", title: "Poker" },
        ]);
    });

    it("should load game jackpots", async () => {
        loadGamesJackpotsReq.mockResolvedValue({ USD: 5000, EUR: 4200 });

        const store = useGamesCommon();
        await store.loadGamesJackpots();

        expect(store.gamesJackpots).toEqual({ USD: 5000, EUR: 4200 });
    });

    it("should get jackpot total formatted", () => {
        const store = useGamesCommon();
        store.gamesJackpots = { USD: { game1: 1000, game2: 2000 } };

        expect(store.getJackpotTotalByCurrency).toBe("formatted-3000");
    });

    it("should add game to cache", () => {
        const store = useGamesCommon();
        const game = { identifier: "game1", title: "Game 1" };

        store.setGameToCache(game);

        expect(store.gamesDataCached).toEqual({ game1: game });
    });

    it("should get game from cache by identifier", () => {
        const store = useGamesCommon();
        const game = { identifier: "game1", title: "Game 1" };

        store.setGameToCache(game);

        expect(store.getGameFromCache({ identifier: "game1" })).toEqual(game);
    });

    it("should get processed recent games sorted by last activity", () => {
        const store = useGamesCommon();
        store.recentGames = {
            game1: { identifier: "game1", last_activity_at: "2024-02-24T12:00:00Z" },
            game2: { identifier: "game2", last_activity_at: "2024-02-25T12:00:00Z" },
        };

        expect(store.getRecentGames).toEqual([
            { identifier: "game2", last_activity_at: "2024-02-25T12:00:00Z", processed: true, id: "game2" },
            { identifier: "game1", last_activity_at: "2024-02-24T12:00:00Z", processed: true, id: "game1" },
        ]);
    });

    it("should load last games and update recent games", async () => {
        loadLastGamesReq.mockResolvedValue([
            { identifier: "game1", title: "Game 1" },
            { identifier: "game2", title: "Game 2" },
        ]);

        loadFilteredGamesReq.mockResolvedValue({
            game1: { extraData: "filteredGame1" },
            game2: { extraData: "filteredGame2" },
        });

        const store = useGamesCommon();
        await store.loadLastGames();

        expect(loadFilteredGamesReq).toHaveBeenCalledWith({
            game_ids: [ "game1", "game2" ],
            device: "desktop",
        });

        expect(store.recentGames).toEqual({
            game1: { identifier: "game1", title: "Game 1", extraData: "filteredGame1" },
            game2: { identifier: "game2", title: "Game 2", extraData: "filteredGame2" },
        });
    });

    it("should clear recent games", () => {
        const store = useGamesCommon();
        store.recentGames = { game1: { identifier: "game1", title: "Game 1" } };

        store.clearRecentGames();

        expect(store.recentGames).toEqual({});
    });

    it("should return empty string if category slug is not found", () => {
        const store = useGamesCommon();
        store.gamesCategories = [ { slug: "slots", name: "Slots" } ];

        expect(store.getGameCategoryNameBySlug("poker")).toBe("");
    });

    it("should return category name if slug exists", () => {
        const store = useGamesCommon();
        store.gamesCategories = [ { slug: "slots", name: "Slots" } ];

        expect(store.getGameCategoryNameBySlug("slots")).toBe("Slots");
    });
});
