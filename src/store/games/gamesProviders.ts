import { SPECIAL_GAME_PROVIDER_NAME } from "@theme/configs/games";
import { defineStore, type Pinia, storeToRefs } from "pinia";
import { ref, type UnwrapRef } from "vue";

import { log } from "../../controllers/Logger";
import { processGameForNewAPI } from "../../helpers/gameHelpers";
import type {
    ICollectionItem,
    ICollections,
    IDisabledGamesProvider,
    IGamesProvider,
    IGamesProviderCollection,
} from "../../models/game";
import { http } from "../../services/api/http";
import { useConfigStore } from "../configStore";
import { useRootStore } from "../root";
import { useGamesCommon } from "./gamesStore";
import { defaultCollection, filterProviders } from "./helpers/games";


export const useGamesProviders = defineStore("gamesProviders", () => {
    const { isMobile } = storeToRefs(useRootStore());
    const gamesProviders = ref<IGamesProvider[]>([] as IGamesProvider[]);
    const disabledGamesProviders = ref<IDisabledGamesProvider>({});
    const collections = ref<ICollections>({});
    const gamesProvidersCollectionData = ref<IGamesProviderCollection>({});
    const { gamesPageLimit } = storeToRefs(useConfigStore());

    function getCollection(slug: string, page: number = 1, startPage: number = 0) {
        return collections.value[slug]?.data.slice(startPage * gamesPageLimit.value, page * gamesPageLimit.value) || [];
    }

    function isLoaded(slug: string, page: number) {
        const collection = collections.value[slug];

        return Boolean(collection) && ((page === 1 && collection.data.length) ||
            collection.pagination.next_page === null ||
            page > collection.pagination.next_page ||
            collection.pagination.current_page >= page);
    }

    function getProviderBySlug(slug: string): IGamesProvider | undefined {
        // workaround to not display ss provider
        const sanitizedSlug = slug === SPECIAL_GAME_PROVIDER_NAME ? "bgaming" : slug;
        return gamesProviders.value.find((providerObj: IGamesProvider) => providerObj.slug === sanitizedSlug);
    }

    function getGameCategoryOrProviderByUrl(searchUrl: string): IGamesProvider {
        const url = searchUrl[searchUrl.length - 1] === "/" ? searchUrl.slice(0, -1) : searchUrl;
        const { getGamesCategories } = storeToRefs(useGamesCommon());

        return [ ...getGamesCategories.value, ...gamesProviders.value ].find((obj) => {
            return obj.url === url;
        });
    }

    function setAllProviders(providers: IGamesProvider[]): void {
        gamesProviders.value = providers;

        for (const item of providers) {
            gamesProvidersCollectionData.value[item.id] = item;
        }
    }

    function setDisabledGamesProviders(data: IDisabledGamesProvider): void {
        disabledGamesProviders.value = data;
    }

    async function setData(data: ICollectionItem, slug) {
        const propsGame = { ...data };
        propsGame.data = data.data.map(processGameForNewAPI);

        const collectionData = collections.value[slug]?.data || [];

        collections.value = {
            ...collections.value,
            [slug]: {
                data: [ ...collectionData, ...propsGame.data ],
                pagination: data.pagination,
            },
        };
    }

    async function initCollection(data: IGamesProvider[]) {
        if (!data) {
            return;
        }

        const combineCollections: Record<string, ICollectionItem> = {};

        data.forEach((item) => {
            if (collections.value[item.slug]) {
                return;
            }

            combineCollections[item.slug] = defaultCollection();
        });

        collections.value = {
            ...combineCollections,
            ...collections.value,
        };
    }

    async function loadData({ slug, page = 1 }: { slug: string, page?: number }): Promise<UnwrapRef<ICollectionItem>> {
        const isLoadedData = isLoaded(slug, page);
        if (isLoadedData) {
            return collections.value[slug];
        }

        try {
            const { data } = await http().post("/api/games_filter", {
                device: isMobile.value ? "mobile" : "desktop",
                filter: {
                    providers: [ slug ],
                },
                page,
                page_size: gamesPageLimit.value,
            });
            setData(data, slug);
            return data;
        } catch (err) {
            log.error("LOAD_GAMES_CATEGORY_ERROR", err);
            throw err;
        }
    }

    async function loadGamesProviders(): Promise<IGamesProvider[]> {
        try {
            const response = await http().get<{ data: IGamesProvider[] }>("/api/games/providers");

            let data = response.data.map((provider: IGamesProvider) => {
                return {
                    ...provider,
                    provider: provider.id,
                    slug: provider.id,
                    url: `/producers/${ provider.id }`,
                    name: provider.title,
                };
            });

            data = filterProviders(data, disabledGamesProviders.value);

            setAllProviders(data);
            initCollection(data);

            return data;
        } catch (err) {
            log.error("LOAD_GAMES_PROVIDERS_ERROR", err);
            throw err;
        }
    }

    return {
        gamesProviders,
        disabledGamesProviders,
        collections,
        getCollection,
        getGameCategoryOrProviderByUrl,
        getProviderBySlug,

        loadData,
        loadGamesProviders,

        gamesProvidersCollectionData,
        setDisabledGamesProviders,
    };
});

export function useGamesProvidersFetchService(pinia?: Pinia) {
    const gameProvidersStore = useGamesProviders(pinia);

    function loadGamesProviders() {
        return gameProvidersStore.loadGamesProviders();
    }

    return {
        loadGamesProviders,
    };
}
