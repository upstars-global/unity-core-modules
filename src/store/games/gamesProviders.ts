// @ts-expect-error -- TS2307: Cannot find module '@theme/configs/games' or its corresponding type declarations.
import { SPECIAL_GAME_PROVIDER_NAME } from "@theme/configs/games";
import { defineStore, storeToRefs } from "pinia";
import { ref } from "vue";

import { filterGames, processGameForNewAPI } from "../../helpers/gameHelpers";
import type {
    ICollectionItem,
    ICollections,
    IDisabledGamesProvider,
    IGamesProvider,
    IGamesProviderCollection,
} from "../../models/game";
import { useConfigStore } from "../configStore";
import { useGamesCommon } from "./gamesStore";

export const useGamesProviders = defineStore("gamesProviders", () => {
    const gamesProviders = ref<IGamesProvider[]>([] as IGamesProvider[]);
    const disabledGamesProviders = ref<IDisabledGamesProvider>({});
    const collections = ref<ICollections>({});
    const gamesProvidersCollectionData = ref<IGamesProviderCollection>({});
    const { gamesPageLimit } = storeToRefs(useConfigStore());

    function getCollection(slug: string, page: number = 1, startPage: number = 0) {
        return collections.value[slug]?.data.slice(startPage * gamesPageLimit.value, page * gamesPageLimit.value) || [];
    }

    function getProviderBySlug(slug: string): IGamesProvider | undefined {
        // workaround to not display ss provider
        const sanitizedSlug = slug === SPECIAL_GAME_PROVIDER_NAME ? "bgaming" : slug;
        return gamesProviders.value.find((providerObj: IGamesProvider) => providerObj.slug === sanitizedSlug);
    }

    function getGameCategoryOrProviderByUrl(searchUrl: string): IGamesProvider {
        const url = searchUrl[searchUrl.length - 1] === "/" ? searchUrl.slice(0, -1) : searchUrl;
        const { getGamesCategories } = storeToRefs(useGamesCommon());

        // @ts-expect-error -- TS2322: Type '{ id: string; title: string; provider: string; slug: string; url: string; name: string; } | undefined' is not assignable to type 'IGamesProvider'.
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

    function setData(data: ICollectionItem, slug: string) {
        const propsGame = { ...data };
        const { enabledGamesConfig } = storeToRefs(useGamesCommon());

        // @ts-expect-error -- TS2345: Argument of type '(game: IGameItemFilter) => IGameItem' is not assignable to parameter of type '(value: IGame, index: number, array: IGame[]) => IGameItem'.
        propsGame.data = data.data.map(processGameForNewAPI);

        const collectionData = collections.value[slug]?.data || [];

        collections.value = {
            ...collections.value,
            [slug]: {
                data: filterGames(
                    [ ...collectionData, ...propsGame.data ],
                    disabledGamesProviders.value,
                    enabledGamesConfig.value,
                ),
                pagination: data.pagination,
            },
        };
    }

    function setCollections(data: ICollections) {
        collections.value = data;
    }

    return {
        gamesProviders,
        disabledGamesProviders,
        collections,
        setCollections,
        getCollection,
        getGameCategoryOrProviderByUrl,
        getProviderBySlug,
        setAllProviders,
        setData,
        gamesProvidersCollectionData,
        setDisabledGamesProviders,
    };
});
