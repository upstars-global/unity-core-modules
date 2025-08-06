import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

import { log } from "../../../src/controllers/Logger";
import { getRandomGame, processGameForNewAPI } from "../../../src/helpers/gameHelpers";
import type { ICollectionItem, IGame, IGamesProvider } from "../../../src/models/game";
import { loadGamesCategory as loadGamesCategoryReq } from "../../../src/services/api/requests/games";
import { useGamesCategory } from "../../../src/store/games/gamesCategory";

vi.mock("../../../src/controllers/Logger", () => ({
    log: {
        error: vi.fn(),
    },
}));

vi.mock("../../../src/helpers/gameHelpers");
vi.mock("../../../src/services/api/requests/games");

const mockUserGeo = ref("");
vi.mock("../../../src/store/multilang", () => ({
    useMultilangStore: () => ({
        getUserGeo: mockUserGeo,
    }),
}));

const mockIsLogged = ref(false);
const mockUserCurrency = ref("USD");
vi.mock("../../../src/store/user/userInfo", () => ({
    useUserInfo: () => ({
        getIsLogged: mockIsLogged,
        getUserCurrency: mockUserCurrency,
    }),
}));

vi.mock("../../../src/store/configStore", () => ({
    useConfigStore: () => ({
        gamesPageLimit: ref(20),
    }),
}));

vi.mock("../../../src/store/root", () => ({
    useRootStore: () => ({
        isMobile: ref(false),
    }),
}));

const mockGamesCategories = ref<IGamesProvider[]>([]);
vi.mock("../../../src/store/games/gamesStore", () => ({
    useGamesCommon: () => ({
        gamesCategories: mockGamesCategories,
    }),
}));

describe("store/games/gamesCategory", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
        mockUserGeo.value = "";
        mockIsLogged.value = false;
        mockUserCurrency.value = "USD";
        mockGamesCategories.value = [];
    });

    it("should initialize with default values", () => {
        const store = useGamesCategory();
        expect(store.collections).toEqual({});
    });

    describe("categoryGeo", () => {
        it("should return original slug when user has no geo", () => {
            const store = useGamesCategory();
            mockUserGeo.value = "";
            expect(store.categoryGeo("slots")).toBe("slots");
        });

        it("should return original slug when no geo-specific category exists", () => {
            const store = useGamesCategory();
            mockUserGeo.value = "CA";
            mockGamesCategories.value = [ { id: "slots", name: "Slots" } as IGamesProvider ];
            expect(store.categoryGeo("slots")).toBe("slots");
        });

        it("should return geo-specific slug when it exists", () => {
            const store = useGamesCategory();
            mockUserGeo.value = "CA";
            mockGamesCategories.value = [
                { id: "slots", name: "Slots" },
                { id: "slots:ca", name: "Slots CA" },
            ] as IGamesProvider[];
            expect(store.categoryGeo("slots")).toBe("slots:ca");
        });
    });

    describe("loadGamesCategory", () => {
        const mockGameData = { identifier: "provider/game1", title: "Game 1" };
        const mockApiResponse = {
            data: [ mockGameData ],
            pagination: { current_page: 1, next_page: 2 },
        };

        beforeEach(() => {
            vi.mocked(loadGamesCategoryReq).mockResolvedValue(mockApiResponse as ICollectionItem);
            vi.mocked(processGameForNewAPI).mockImplementation((game) => game as IGame);
        });

        it("should call api with correct params and set data", async () => {
            const store = useGamesCategory();
            await store.loadGamesCategory("slots");

            expect(loadGamesCategoryReq).toHaveBeenCalledWith({
                device: "desktop",
                filter: {
                    categories: {
                        identifiers: [ "slots" ],
                        strategy: "OR",
                    },
                },
                page: 1,
                page_size: 20,
            });

            expect(store.collections.slots.data).toHaveLength(1);
            expect(store.collections.slots.pagination.next_page).toBe(2);
        });

        it("should not call api if data is already loaded", async () => {
            const store = useGamesCategory();
            store.collections.slots = {
                data: [ mockGameData as IGame ],
                pagination: { current_page: 1, next_page: null },
            } as ICollectionItem;

            await store.loadGamesCategory("slots", 1);
            expect(loadGamesCategoryReq).not.toHaveBeenCalled();
        });

        it("should log error on api failure", async () => {
            const store = useGamesCategory();
            const error = new Error("API Failed");
            vi.mocked(loadGamesCategoryReq).mockRejectedValue(error);

            await store.loadGamesCategory("slots");

            expect(log.error).toHaveBeenCalledWith("LOAD_GAMES_CATEGORY_ERROR", error);
        });
    });

    describe("getRandomGameByCategory", () => {
        const games = [
            { name: "Game 1", real: { USD: 1 }, categories: [] },
            { name: "Game 2", real: { EUR: 1 }, categories: [] },
            { name: "Game 3", real: { USD: 1 }, categories: [ "live" ] },
        ];

        beforeEach(() => {
            const store = useGamesCategory();
            store.collections.slots = { data: games as IGame[] } as ICollectionItem;
            vi.mocked(getRandomGame).mockImplementation((arr) => arr[0]);
        });

        it("should filter by user currency when logged in", () => {
            const store = useGamesCategory();
            mockIsLogged.value = true;
            mockUserCurrency.value = "USD";

            const randomGame = store.getRandomGameByCategory("slots");

            const expectedGamesToFilter = [ games[0], games[2] ];
            expect(getRandomGame).toHaveBeenCalledWith(expectedGamesToFilter, false);
            expect(randomGame.name).toBe("Game 1");
        });

        it("should filter by demo availability when not logged in", () => {
            const store = useGamesCategory();
            mockIsLogged.value = false;

            const randomGame = store.getRandomGameByCategory("slots");
            expect(getRandomGame).toHaveBeenCalledWith(expect.any(Array), true);
            expect(randomGame.name).toBe("Game 1");
        });
    });

    describe("initCollection", () => {
        it("should initialize new collections without affecting existing ones", () => {
            const store = useGamesCategory();
            store.collections.existing = { data: [ { id: 1 } as IGame ], pagination: { next_page: null } } as ICollectionItem;

            store.initCollection([ { slug: "new1" }, { slug: "new2" }, { slug: "existing" } ]);

            expect(store.collections.existing.data).toHaveLength(1);
            expect(store.collections.new1.data).toEqual([]);
            expect(store.collections.new2.data).toEqual([]);
            expect(Object.keys(store.collections)).toHaveLength(3);
        });
    });
});
