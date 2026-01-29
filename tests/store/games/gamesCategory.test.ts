import { COUNTRY_RESTRICT_STATUS, RESTRICTED_COUNTRIES_LIST } from "@theme/configs/countriesForRedirect451";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

import { log } from "../../../src/controllers/Logger";
import { processGameForNewAPI } from "../../../src/helpers/gameHelpers";
import type { ICollectionItem, IGame, IGamesProvider } from "../../../src/models/game";
import { IEnabledGames } from "../../../src/models/game";
import { loadGamesCategory as loadGamesCategoryReq } from "../../../src/services/api/requests/games";
import { useGamesCategory } from "../../../src/store/games/gamesCategory";

vi.mock("@theme/configs/countriesForRedirect451", () => ({
    COUNTRY_RESTRICT_STATUS: {
        full: "full",
        partial: "partial",
    },
    RESTRICTED_COUNTRIES_LIST: {
        PL: "full",
        US: "partial",
    },
}));

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
                without_territorial_restrictions: false,
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

    describe("Getters", () => {
        const games = Array.from({ length: 50 }, (_, i) => ({ name: `Game ${i + 1}` } as IGame));

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
