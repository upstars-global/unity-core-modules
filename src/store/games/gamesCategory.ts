import { storeToRefs } from "pinia";
import { defineStore } from "pinia";
import { ref, toRefs } from "vue";

import { type IGameItemFilter, processGameForNewAPI } from "../../helpers/gameHelpers";
import { defaultCollection, filterGames } from "../../helpers/gameHelpers";
import type { ICollectionItem, IGame } from "../../models/game";
import type { ICollectionRecord } from "../../services/api/DTO/gamesDTO";
import { useConfigStore } from "../configStore";
import { useMultilangStore } from "../multilang";
import { useGamesProviders } from "./gamesProviders";
import { useGamesCommon } from "./gamesStore";

const DEFAULT_COLLECTION_NAME = "default";

export const useGamesCategory = defineStore("gamesCategory", () => {
    const collections = ref<ICollectionRecord>({});
    const { getUserGeo } = toRefs(useMultilangStore());
    const { gamesPageLimit } = storeToRefs(useConfigStore());

    const categoryGeo = (slug: string): string => {
        const slugWithGeo = getUserGeo.value ? `${ slug }:${ getUserGeo.value.toLocaleLowerCase() }` : "";
        const { gamesCategories } = storeToRefs(useGamesCommon());
        const hasCategory = gamesCategories.value.find((catItem) => {
            return catItem.id === slugWithGeo;
        });

        return hasCategory ? slugWithGeo : slug;
    };

    const getCollection = (slug: string = DEFAULT_COLLECTION_NAME, page: number = 1, startPage: number = 0): IGame[] => {
        const slugCollection = categoryGeo(slug);
        const collection = collections.value[slugCollection];
        return collection?.data.slice(startPage * gamesPageLimit.value, page * gamesPageLimit.value) || [];
    };

    const getCollectionPagination = (slug: string = DEFAULT_COLLECTION_NAME): ICollectionItem["pagination"] | undefined => {
        return collections.value[categoryGeo(slug)]?.pagination;
    };

    const getCollectionFullData = (slug: string = DEFAULT_COLLECTION_NAME): ICollectionItem | undefined => {
        return collections.value[categoryGeo(slug)];
    };

    const isLoaded = (slug: string, page: number): boolean => {
        const collection = collections.value[slug];
        if (!collection) {
            return false;
        }
        return (page === 1 && collection.data.length > 0) ||
            collection.pagination.next_page === null ||
            // @ts-expect-error -- TS18048: 'collection.pagination.next_page' is possibly 'undefined'.
            (collection.pagination.next_page !== null && page > collection.pagination.next_page) ||
            collection.pagination.current_page >= page;
    };

    function setData(
        data: Omit<ICollectionItem, "data"> & { data: IGameItemFilter[] },
        slug: string,
        replace = false,
    ): boolean {
        const { disabledGamesProviders } = storeToRefs(useGamesProviders());
        const { enabledGamesConfig } = storeToRefs(useGamesCommon());

        const games = filterGames(
            data.data.map(processGameForNewAPI),
            disabledGamesProviders.value,
            enabledGamesConfig.value,
        );

        if (replace && !games.length) {
            return false;
        }

        if (replace || !collections.value[slug]) {
            collections.value = {
                ...collections.value,
                [slug]: { ...data, data: games },
            };
        } else {
            collections.value[slug].data.push(...games);
            collections.value[slug].pagination = data.pagination;
        }
        return true;
    }

    function initCollection(data: { slug: string }[]): void {
        if (!data) {
            return;
        }
        data.forEach((item) => {
            if (collections.value[item.slug]) {
                return;
            }
            collections.value[item.slug] = defaultCollection();
        });
    }


    return {
        collections,
        categoryGeo,
        getCollection,
        getCollectionFullData,
        getCollectionPagination,
        isLoaded,
        initCollection,
        setData,
    };
});
