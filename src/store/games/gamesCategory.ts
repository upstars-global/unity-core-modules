import { COUNTRY_RESTRICT_STATUS, RESTRICTED_COUNTRIES_LIST } from "@theme/configs/countriesForRedirect451";
import { type Pinia, storeToRefs } from "pinia";
import { defineStore } from "pinia";
import { ref, toRefs } from "vue";

import { log } from "../../controllers/Logger";
import { processGameForNewAPI } from "../../helpers/gameHelpers";
import type { ICollectionItem, IGame } from "../../models/game";
import type { ICollectionRecord, IGameFilter } from "../../services/api/DTO/gamesDTO";
import { loadGamesCategory as loadGamesCategoryReq } from "../../services/api/requests/games";
import { useCommon } from "../common";
import { useConfigStore } from "../configStore";
import { useContextStore } from "../context";
import { useMultilangStore } from "../multilang";
import { useRootStore } from "../root";
import { useUserInfo } from "../user/userInfo";
import { useGamesCommon } from "./gamesStore";
import { defaultCollection, filterGames } from "./helpers/games";

const DEFAULT_COLLECTION_NAME = "default";

export const useGamesCategory = defineStore("gamesCategory", () => {
    const collections = ref<ICollectionRecord>({});
    const { getUserGeo } = toRefs(useMultilangStore());
    const { gamesPageLimit } = storeToRefs(useConfigStore());

    const categoryGeo = (slug: string): string => {
        const slugWithGeo = getUserGeo.value ? `${slug}:${getUserGeo.value.toLocaleLowerCase()}` : "";
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
            (collection.pagination.next_page !== null && page > collection.pagination.next_page) ||
            collection.pagination.current_page >= page;
    };

    function setData(data: ICollectionItem, slug: string): void {
        const propsGame = { ...data };
        propsGame.data = filterGames(data.data.map(processGameForNewAPI));

        if (!collections.value[slug]) {
            collections.value = {
                ...collections.value,
                [slug]: propsGame,
            };
        } else {
            collections.value[slug].data.push(...propsGame.data);
            collections.value[slug].pagination = data.pagination;
        }
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

    async function loadGamesCategory(slug: string, page: number = 1): Promise<ICollectionItem | undefined> {
        const slugCollection = categoryGeo(slug);
        const loaded = isLoaded(slugCollection, page);

        if (loaded) {
            return collections.value[slugCollection];
        }

        try {
            const { isMobile } = storeToRefs(useRootStore());
            const { isBotUA } = storeToRefs(useContextStore());
            const { currentIpInfo } = storeToRefs(useCommon());
            const { getIsLogged } = storeToRefs(useUserInfo());

            const device = isMobile.value ? "mobile" : "desktop";
            const isBotFromRestrictGeo = RESTRICTED_COUNTRIES_LIST && COUNTRY_RESTRICT_STATUS ?
                Boolean(
                    isBotUA.value &&
                    !getIsLogged.value &&
                    RESTRICTED_COUNTRIES_LIST[String(currentIpInfo.value?.country_code)] === COUNTRY_RESTRICT_STATUS.partial,
                ) : false;

            const reqConfig: IGameFilter = {
                without_territorial_restrictions: isBotFromRestrictGeo,
                device,
                filter: {
                    categories: {
                        identifiers: [ slugCollection ],
                        strategy: "OR",
                    },
                },
                page,
                page_size: gamesPageLimit.value,
            };

            const data = await loadGamesCategoryReq(reqConfig);
            setData(data, slugCollection);
        } catch (err) {
            log.error("LOAD_GAMES_CATEGORY_ERROR", err);
        }
    }

    return {
        collections,

        categoryGeo,
        getCollection,
        getCollectionFullData,
        getCollectionPagination,
        isLoaded,

        loadGamesCategory,
        initCollection,
    };
});

export function useGamesCategoryFetchService(pinia?: Pinia) {
    const { initCollection } = useGamesCategory(pinia);

    return {
        initCollection,
    };
}
