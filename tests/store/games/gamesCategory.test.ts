import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

import { log } from "../../../src/controllers/Logger";
import { filterGames, type IGameItemFilter, processGameForNewAPI } from "../../../src/helpers/gameHelpers";
import type { ICollectionItem, IGame, IGamesProvider } from "../../../src/models/game";
import { IEnabledGames } from "../../../src/models/game";
import { loadGamesByIdsReq, loadGamesCategoryReq, loadPlayaRecommendationsReq } from "../../../src/services/api/requests/games";
import { loadGamesByIds, loadGamesCategory } from "../../../src/services/games";
import { useGamesCategory } from "../../../src/store/games/gamesCategory";

vi.mock("../../../src/controllers/Logger", () => ({
    log: {
        error: vi.fn(),
    },
}));

vi.mock("../../../src/helpers/gameHelpers", () => ({
    processGameForNewAPI: vi.fn((game) => game),
    filterGames: vi.fn((games) => games),
    defaultCollection: vi.fn(() => ({
        data: [],
        pagination: {
            current_page: 0,
            next_page: undefined,
            prev_page: undefined,
            total_pages: 0,
            total_count: 0,
        },
    })),
}));
vi.mock("../../../src/services/api/requests/games");

const mockUserGeo = ref("");
vi.mock("../../../src/store/multilang", () => ({
    useMultilangStore: () => ({
        getUserGeo: mockUserGeo,
    }),
}));

const mockIsLogged = ref(false);
const mockProfileLoaded = ref(true);
const mockUserCurrency = ref("USD");
const mockUserGroups: Array<string | number> = [];
vi.mock("../../../src/store/user/userInfo", () => ({
    useUserInfo: () => ({
        get getIsLogged() { return mockIsLogged.value; },
        get getDataIsLoaded() { return mockProfileLoaded.value; },
        getUserCurrency: mockUserCurrency,
    }),
}));
vi.mock("../../../src/store/user/userStatuses", () => ({
    useUserStatuses: () => ({ getUserGroups: mockUserGroups }),
}));

vi.mock("../../../src/store/configStore", () => ({
    useConfigStore: () => ({
        gamesPageLimit: ref(20),
        $defaultProjectConfig: {
            featureFlags: {
                enableAllProviders: false,
            },
        },
    }),
}));

vi.mock("../../../src/store/root", () => ({
    useRootStore: () => ({
        isMobile: ref(false),
    }),
}));

const mockGamesCategories = ref<IGamesProvider[]>([]);
const mockEnabledGamesConfig = ref<IEnabledGames>({});
vi.mock("../../../src/store/games/gamesStore", () => ({
    useGamesCommon: () => ({
        gamesCategories: mockGamesCategories,
        enabledGamesConfig: mockEnabledGamesConfig,
    }),
}));

describe("store/games/gamesCategory", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
        mockUserGeo.value = "";
        mockIsLogged.value = false;
        mockProfileLoaded.value = true;
        mockUserCurrency.value = "USD";
        mockGamesCategories.value = [];
        mockUserGroups.length = 0;
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

    describe("loadGamesByIds", () => {
        it("returns available catalogue cards in the requested order", async () => {
            const first = { identifier: "studio/first", is_geo_available: true } as IGameItemFilter;
            const second = { identifier: "studio/second" } as IGameItemFilter;
            const blocked = { identifier: "studio/blocked", is_geo_available: false } as IGameItemFilter;
            const gameIds = [ first.identifier, "studio/missing", "constructor", blocked.identifier, second.identifier ];
            vi.mocked(loadGamesByIdsReq).mockResolvedValueOnce({
                [second.identifier]: second,
                [blocked.identifier]: blocked,
                [first.identifier]: first,
            });

            await expect(loadGamesByIds(gameIds, "mobile")).resolves.toEqual([ first, second ]);
            expect(loadGamesByIdsReq).toHaveBeenCalledExactlyOnceWith(gameIds, "mobile");
        });

        it("returns an empty list without calling the catalogue for an empty page", async () => {
            await expect(loadGamesByIds([], "desktop")).resolves.toEqual([]);
            expect(loadGamesByIdsReq).not.toHaveBeenCalled();
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
            await loadGamesCategory("slots");

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

            await loadGamesCategory("slots", 1);
            expect(loadGamesCategoryReq).not.toHaveBeenCalled();
        });

        it("replaces cached Top with the recommended cards for the Playa group", async () => {
            const store = useGamesCategory();
            mockUserGeo.value = "AU";
            mockGamesCategories.value = [ { id: "top:au" } as IGamesProvider ];
            store.collections["top:au"] = {
                data: [ mockGameData as IGame ],
                pagination: { current_page: 1, next_page: null },
            } as ICollectionItem;
            mockUserGroups.push("playa_au");
            const game = { identifier: "studio/personal" } as IGameItemFilter;
            vi.mocked(loadPlayaRecommendationsReq).mockResolvedValueOnce({
                gameIds: [ game.identifier ],
                pagination: { page: 1, limit: 20, total: 25 },
            });
            vi.mocked(loadGamesByIdsReq).mockResolvedValueOnce({ [game.identifier]: game });

            await loadGamesCategory("top");

            expect(loadPlayaRecommendationsReq).toHaveBeenCalledWith(1, 20);
            expect(loadGamesByIdsReq).toHaveBeenCalledWith([ game.identifier ], "desktop");
            expect(loadGamesCategoryReq).not.toHaveBeenCalled();
            expect(store.collections["top:au"].data).toEqual([ game ]);
            expect(store.collections["top:au"].isPlaya).toBe(true);
            expect(store.collections["top:au"].pagination.next_page).toBe(2);
        });

        it.each([ 1, 2 ])("loads Playa page %i after the profile arrives on a cold start", async (page) => {
            mockUserGeo.value = "AU";
            mockGamesCategories.value = [ { id: "top:au" } as IGamesProvider ];
            mockIsLogged.value = true;
            mockProfileLoaded.value = false;
            const game = { identifier: "studio/personal" } as IGameItemFilter;
            vi.mocked(loadPlayaRecommendationsReq).mockResolvedValueOnce({
                gameIds: [ game.identifier ],
                pagination: { page, limit: 20, total: 40 },
            });
            vi.mocked(loadGamesByIdsReq).mockResolvedValueOnce({ [game.identifier]: game });

            const loading = loadGamesCategory("top", page);
            expect(loadGamesCategoryReq).not.toHaveBeenCalled();
            expect(loadPlayaRecommendationsReq).not.toHaveBeenCalled();
            mockUserGroups.push("playa_au");
            mockProfileLoaded.value = true;
            await loading;

            expect(loadPlayaRecommendationsReq).toHaveBeenCalledWith(page, 20);
            expect(loadGamesCategoryReq).not.toHaveBeenCalled();
            expect(useGamesCategory().getCollection("top", page, page - 1)).toEqual([ game ]);
        });

        it.each([ true, false ])("replaces a second-page cache on page 1 when Playa availability is %s", async (hasRecommendations) => {
            const store = useGamesCategory();
            mockUserGeo.value = "AU";
            mockGamesCategories.value = [ { id: "top:au" } as IGamesProvider ];
            mockUserGroups.push("playa_au");
            store.collections["top:au"] = {
                data: [ mockGameData as IGame ],
                isPlaya: true,
                firstPage: 2,
                pagination: { current_page: 2, next_page: null, prev_page: 1, total_pages: 2, total_count: 40 },
            };
            const game = { identifier: "studio/personal" } as IGameItemFilter;
            vi.mocked(loadPlayaRecommendationsReq).mockResolvedValueOnce(hasRecommendations ? {
                gameIds: [ game.identifier ],
                pagination: { page: 1, limit: 20, total: 40 },
            } : undefined);
            vi.mocked(loadGamesByIdsReq).mockResolvedValueOnce({ [game.identifier]: game });

            await loadGamesCategory("top");

            expect(loadPlayaRecommendationsReq).toHaveBeenCalledWith(1, 20);
            expect(loadGamesCategoryReq).toHaveBeenCalledTimes(hasRecommendations ? 0 : 1);
            expect(store.getCollection("top")).toEqual([ hasRecommendations ? game : mockGameData ]);
            expect(Boolean(store.collections["top:au"].isPlaya)).toBe(hasRecommendations);
            expect(store.collections["top:au"].firstPage).toBe(hasRecommendations ? 1 : undefined);
        });

        it.each([
            { slug: "top", geo: "AU", key: "top:au", groups: [ 21 ] },
            { slug: "slots", geo: "AU", key: "slots", groups: [ "playa_au" ] },
            { slug: "top", geo: "DE", key: "top:de", groups: [ "playa_au" ] },
            { slug: "top:au", geo: "DE", key: "top:au", groups: [ "playa_au" ] },
        ])("uses the ordinary loader for $key with groups $groups", async ({ slug, geo, key, groups }) => {
            mockUserGeo.value = geo;
            mockGamesCategories.value = [ { id: key } as IGamesProvider ];
            mockUserGroups.push(...groups);

            await loadGamesCategory(slug);

            expect(loadGamesCategoryReq).toHaveBeenCalledWith(expect.objectContaining({
                filter: { categories: { identifiers: [ key ], strategy: "OR" } },
            }));
            expect(loadPlayaRecommendationsReq).not.toHaveBeenCalled();
        });

        it.each([{ gameIds: undefined }, { gameIds: [] }])("loads and keeps ordinary Top when the first recommendation page is %j", async ({ gameIds }) => {
            mockUserGeo.value = "AU";
            mockGamesCategories.value = [ { id: "top:au" } as IGamesProvider ];
            mockUserGroups.push("playa_au");
            vi.mocked(loadPlayaRecommendationsReq).mockResolvedValueOnce(gameIds && {
                gameIds,
                pagination: { page: 1, limit: 20, total: 0 },
            });

            await loadGamesCategory("top", 1);
            await loadGamesCategory("top", 2);

            expect(loadPlayaRecommendationsReq).toHaveBeenCalledTimes(1);
            expect(loadGamesCategoryReq).toHaveBeenCalledTimes(2);
            expect(useGamesCategory().collections["top:au"].isPlaya).toBeUndefined();
        });

        it("falls back when the CMS filters out the first personalized page", async () => {
            mockUserGeo.value = "AU";
            mockGamesCategories.value = [ { id: "top:au" } as IGamesProvider ];
            mockUserGroups.push("playa_au");
            const game = { identifier: "studio/personal" } as IGameItemFilter;
            vi.mocked(loadPlayaRecommendationsReq).mockResolvedValueOnce({
                gameIds: [ game.identifier ],
                pagination: { page: 1, limit: 20, total: 1 },
            });
            vi.mocked(loadGamesByIdsReq).mockResolvedValueOnce({ [game.identifier]: game });
            vi.mocked(filterGames).mockReturnValueOnce([]);

            await loadGamesCategory("top");

            expect(loadGamesCategoryReq).toHaveBeenCalledTimes(1);
            expect(useGamesCategory().collections["top:au"].data).toEqual([ mockGameData ]);
        });

        it.each([ true, false ])("stops on a valid empty last page with an existing collection: %s", async (hasCollection) => {
            const store = useGamesCategory();
            mockUserGeo.value = "AU";
            mockGamesCategories.value = [ { id: "top:au" } as IGamesProvider ];
            mockUserGroups.push("playa_au");
            if (hasCollection) {
                store.collections["top:au"] = {
                    data: [ mockGameData as IGame ],
                    isPlaya: true,
                    firstPage: 1,
                    pagination: { current_page: 1, next_page: 2, prev_page: null, total_pages: 2, total_count: 25 },
                };
            }
            vi.mocked(loadPlayaRecommendationsReq).mockResolvedValueOnce({
                gameIds: [],
                pagination: { page: 2, limit: 20, total: 25 },
            });

            await loadGamesCategory("top", 2);

            expect(store.collections["top:au"].data).toEqual(hasCollection ? [ mockGameData ] : []);
            expect(store.collections["top:au"].firstPage).toBe(hasCollection ? 1 : 2);
            expect(store.collections["top:au"].pagination.next_page).toBeNull();
            expect(loadGamesCategoryReq).not.toHaveBeenCalled();
        });

        it("should log error on api failure", async () => {
            const error = new Error("API Failed");
            vi.mocked(loadGamesCategoryReq).mockRejectedValue(error);

            await loadGamesCategory("slots");

            expect(log.error).toHaveBeenCalledWith("LOAD_GAMES_CATEGORY_BY_SLUG_ERROR", error);
        });

        it("should ignore invalid response without setting collection data", async () => {
            const store = useGamesCategory();
            vi.mocked(loadGamesCategoryReq).mockResolvedValue({} as never);

            await loadGamesCategory("slots");

            expect(store.collections.slots).toBeUndefined();
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

        it("returns early when initCollection gets falsy data", () => {
            const store = useGamesCategory();
            store.initCollection(undefined as never);
            expect(store.collections).toEqual({});
        });
    });

    describe("Getters", () => {
        const games = Array.from({ length: 50 }, (_, i) => ({ name: `Game ${ i + 1 }` } as IGame));

        beforeEach(() => {
            const store = useGamesCategory();
            store.collections = {
                slots: {
                    data: games,
                    pagination: {
                        current_page: 3,
                        next_page: 4,
                    },
                } as ICollectionItem,
                last: {
                    data: games.slice(0, 10),
                    pagination: {
                        current_page: 5,
                        next_page: null,
                    },
                } as ICollectionItem,
                empty: { data: [], pagination: { current_page: 0, next_page: 1 } } as ICollectionItem,
            };
        });

        describe("getCollection", () => {
            it("should return an empty array for a non-existent collection", () => {
                const store = useGamesCategory();
                expect(store.getCollection("non-existent")).toEqual([]);
            });

            it("should return items up to the first page by default", () => {
                const store = useGamesCategory();
                const result = store.getCollection("slots");
                expect(result).toHaveLength(20);
                expect(result[0].name).toBe("Game 1");
                expect(result[19].name).toBe("Game 20");
            });

            it("should return items up to the specified page", () => {
                const store = useGamesCategory();
                const page2 = store.getCollection("slots", 2);
                expect(page2).toHaveLength(40);
                expect(page2[0].name).toBe("Game 1");
                expect(page2[39].name).toBe("Game 40");
            });

            it("should handle request for pages beyond available data", () => {
                const store = useGamesCategory();
                const page4 = store.getCollection("slots", 4);
                expect(page4).toHaveLength(50);
                expect(page4[49].name).toBe("Game 50");
            });

            it("should respect the startPage parameter, slicing from a different start", () => {
                const store = useGamesCategory();
                const result = store.getCollection("slots", 3, 1);
                expect(result).toHaveLength(30);
                expect(result[0].name).toBe("Game 21");
                expect(result[29].name).toBe("Game 50");
            });
        });

        describe("getCollectionPagination", () => {
            it("should return undefined for a non-existent collection", () => {
                const store = useGamesCategory();
                expect(store.getCollectionPagination("non-existent")).toBeUndefined();
            });

            it("should return the pagination object for an existing collection", () => {
                const store = useGamesCategory();
                expect(store.getCollectionPagination("slots")?.current_page).toBe(3);
                expect(store.getCollectionPagination("slots")?.next_page).toBe(4);
            });
        });

        describe("getCollectionFullData", () => {
            it("should return undefined for a non-existent collection", () => {
                const store = useGamesCategory();
                expect(store.getCollectionFullData("non-existent")).toBeUndefined();
            });

            it("should return the full collection data for an existing collection", () => {
                const store = useGamesCategory();
                expect(store.getCollectionFullData("slots")?.data).toHaveLength(50);
            });
        });

        it("setData appends data to existing collection", () => {
            const store = useGamesCategory();
            store.collections.slots = {
                data: [ { identifier: "old" } as IGame ],
                pagination: { current_page: 1, next_page: 2 },
            } as ICollectionItem;

            store.setData({
                data: [ { identifier: "new" } as IGameItemFilter ],
                pagination: { current_page: 2, next_page: null, prev_page: 1, total_pages: 2, total_count: 2 },
            }, "slots");

            expect(store.collections.slots.data).toHaveLength(2);
            expect(store.collections.slots.pagination.next_page).toBeNull();
        });

        describe("isLoaded", () => {
            it("should return false if collection does not exist", () => {
                const store = useGamesCategory();
                expect(store.isLoaded("non-existent", 1)).toBe(false);
            });

            it("should return true for page 1 if collection has data", () => {
                const store = useGamesCategory();
                expect(store.isLoaded("slots", 1)).toBe(true);
            });

            it("should return false for page 1 if collection has no data", () => {
                const store = useGamesCategory();
                expect(store.isLoaded("empty", 1)).toBe(false);
            });

            it("should return true if there is no next page", () => {
                const store = useGamesCategory();
                expect(store.isLoaded("last", 5)).toBe(true);
                expect(store.isLoaded("last", 99)).toBe(true);
            });

            it("should return true if the requested page is already covered by current_page", () => {
                const store = useGamesCategory();
                expect(store.isLoaded("slots", 1)).toBe(true);
                expect(store.isLoaded("slots", 2)).toBe(true);
                expect(store.isLoaded("slots", 3)).toBe(true);
            });

            it("should return false if the requested page is not yet loaded", () => {
                const store = useGamesCategory();
                expect(store.isLoaded("slots", 4)).toBe(false);
            });

            it("should return true if requested page is beyond the next page to be loaded", () => {
                const store = useGamesCategory();
                expect(store.isLoaded("slots", 5)).toBe(true);
            });
        });
    });
});
