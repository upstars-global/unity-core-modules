import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

import { IGameItemFilter, processGameForNewAPI } from "../../../src/helpers/gameHelpers";
import type { ICollectionItem, IGamesProvider } from "../../../src/models/game";
import { IEnabledGames } from "../../../src/models/game";
import { http } from "../../../src/services/api/http";
import { loadData, loadGamesProviders } from "../../../src/services/games";
import { useGamesProviders } from "../../../src/store/games/gamesProviders";

vi.mock("../../../src/services/api/http");
vi.mock("../../../src/controllers/Logger", () => ({
    log: {
        error: vi.fn(),
    },
}));
vi.mock("../../../src/helpers/gameHelpers", () => ({
    processGameForNewAPI: vi.fn((game) => game),
    filterProviders: vi.fn((data) => data),
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
    isLoaded: vi.fn((collection, page) => {
        return Boolean(collection) && ((page === 1 && collection.data.length) ||
            collection.pagination.next_page === null ||
            page > collection.pagination.next_page ||
            collection.pagination.current_page >= page);
    }),
}));
vi.mock("../../../src/helpers/games");

vi.mock("../../../src/store/root", () => ({
    useRootStore: () => ({
        isMobile: ref(false),
    }),
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
const mockGamesCategories = ref<IGamesProvider[]>([]);
const mockEnabledGamesConfig = ref<IEnabledGames>({});
vi.mock("../../../src/store/games/gamesStore", () => ({
    useGamesCommon: () => ({
        getGamesCategories: mockGamesCategories,
        enabledGamesConfig: mockEnabledGamesConfig,
    }),
}));
vi.mock("@theme/configs/games", () => ({
    SPECIAL_GAME_PROVIDER_NAME: "special_provider",
}));

describe("store/games/gamesProviders", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    it("should have correct initial state", () => {
        const store = useGamesProviders();

        expect(store.gamesProviders).toEqual([]);
        expect(store.collections).toEqual({});
        expect(store.gamesProvidersCollectionData).toEqual({});
    });

    describe("actions", () => {
        it("loadGamesProviders should fetch and set providers", async () => {
            const store = useGamesProviders();
            const mockProviders = [
                { id: "provider1", title: "Provider 1" },
                { id: "provider2", title: "Provider 2" },
            ];
            vi.mocked(http).mockReturnValue({
                get: vi.fn().mockResolvedValue({ data: mockProviders }),
                post: vi.fn(),
            });

            await loadGamesProviders();

            expect(store.gamesProviders).toHaveLength(2);
            expect(store.gamesProviders[0].slug).toBe("provider1");
            expect(store.collections.provider1).toBeDefined();
        });

        it("loadGamesProviders should handle API errors", async () => {
            const store = useGamesProviders();
            vi.mocked(http).mockReturnValue({
                get: vi.fn().mockRejectedValue(new Error("API Error")),
                post: vi.fn(),
            });

            await expect(loadGamesProviders()).resolves.toEqual([]);
            expect(store.gamesProviders).toEqual([]);
        });

        it("loadData should fetch and set games for a provider", async () => {
            const store = useGamesProviders();

            const slug = "provider1";
            const mockGames = {
                data: [
                    {
                        identifier: "provider1/game1",
                        title: "Game 1",
                        currencies: {},
                        categories: [],
                    },
                ],
                pagination: { current_page: 1, next_page: 2 },
            };

            // Initialize collection before loading data
            store.collections[slug] = {
                data: [],
                pagination: { current_page: 0, next_page: 1 },
            } as ICollectionItem;

            vi.mocked(http).mockReturnValue({
                get: vi.fn(),
                post: vi.fn().mockResolvedValue({ data: mockGames }),
            });
            vi.mocked(processGameForNewAPI).mockImplementation((game) => game as IGameItemFilter);

            await loadData({ slug });

            expect(store.collections[slug].data).toHaveLength(1);
            expect(store.collections[slug].pagination.next_page).toBe(2);
        });

        it("loadData should not fetch if data is already loaded", async () => {
            const store = useGamesProviders();
            const slug = "provider1";
            store.collections[slug] = {
                data: [ { id: 1, name: "Game 1" } ],
                pagination: { current_page: 1, next_page: null },
            } as ICollectionItem;

            const postMock = vi.fn();
            vi.mocked(http).mockReturnValue({
                get: vi.fn(),
                post: postMock,
            });

            await loadData({ slug });

            expect(postMock).not.toHaveBeenCalled();
        });

        it("loadData should handle API errors", async () => {
            const store = useGamesProviders();
            const slug = "provider1";
            vi.mocked(http).mockReturnValue({
                get: vi.fn(),
                post: vi.fn().mockRejectedValue(new Error("API Error")),
            });

            await expect(loadData({ slug })).rejects.toThrow();
        });
    });

    describe("getters and functions", () => {
        it("getCollection returns empty array for missing collection", () => {
            const store = useGamesProviders();

            expect(store.getCollection("missing")).toEqual([]);
        });

        it("getCollection returns paged items", () => {
            const store = useGamesProviders();
            store.collections.test = {
                data: Array.from({ length: 30 }, (_, i) => ({ id: i + 1 })),
                pagination: { current_page: 1, next_page: 2 },
            } as ICollectionItem;

            expect(store.getCollection("test", 1)).toHaveLength(20);
            expect(store.getCollection("test", 2)).toHaveLength(30);
        });
        it("getCollection should return the correct slice of games", () => {
            const store = useGamesProviders();
            const slug = "provider1";
            store.collections[slug] = {
                data: Array.from({ length: 50 }, (_, i) => ({ id: i + 1 })),
                pagination: { current_page: 2, next_page: 3 },
            } as ICollectionItem;

            const collectionPage1 = store.getCollection(slug, 1);
            expect(collectionPage1).toHaveLength(20);

            const collectionPage2 = store.getCollection(slug, 2);
            expect(collectionPage2).toHaveLength(40);
        });

        it("getProviderBySlug should return the correct provider", () => {
            const store = useGamesProviders();
            store.gamesProviders = [
                { slug: "provider1", name: "Provider 1" },
                { slug: "provider2", name: "Provider 2" },
            ] as IGamesProvider[];

            const provider = store.getProviderBySlug("provider1");
            expect(provider?.name).toBe("Provider 1");
        });

        it("getProviderBySlug maps special provider slug", () => {
            const store = useGamesProviders();
            store.gamesProviders = [
                { slug: "bgaming", name: "BGaming" },
            ] as IGamesProvider[];

            const provider = store.getProviderBySlug("special_provider");
            expect(provider?.name).toBe("BGaming");
        });

        it("getGameCategoryOrProviderByUrl should return the correct object", () => {
            const store = useGamesProviders();
            store.gamesProviders = [
                { url: "/producers/provider1", name: "Provider 1" },
            ] as IGamesProvider[];

            mockGamesCategories.value = [
                { url: "/categories/slots", name: "Slots" },
            ];

            const provider = store.getGameCategoryOrProviderByUrl("/producers/provider1");
            expect(provider?.name).toBe("Provider 1");

            const category = store.getGameCategoryOrProviderByUrl("/categories/slots/");
            expect(category?.name).toBe("Slots");
        });

        it("setDisabledGamesProviders updates disabled providers", () => {
            const store = useGamesProviders();
            store.setDisabledGamesProviders({ provider1: [ "game1" ] });
            expect(store.disabledGamesProviders).toEqual({ provider1: [ "game1" ] });
        });

        it("setData merges new data with existing collection", () => {
            const store = useGamesProviders();
            store.collections.test = {
                data: [ { id: 1 } ],
                pagination: { current_page: 1, next_page: 2 },
            } as ICollectionItem;

            store.setData({
                data: [ { id: 2 } ],
                pagination: { current_page: 2, next_page: null },
            } as ICollectionItem, "test");

            expect(store.collections.test.data).toHaveLength(2);
            expect(store.collections.test.pagination.next_page).toBeNull();
        });
    });
});
