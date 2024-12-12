import { useMultilang } from "@store/multilang";
import { useUserInfo } from "@store/user/userInfo";
import { DEFAULT_PAGE_LIMIT } from "@theme/configs/games";
import { type Pinia, storeToRefs } from "pinia";
import { defineStore } from "pinia";
import { ref, toRefs } from "vue";

import log from "../../controllers/Logger";
import { getRandomGame, processGameForNewAPI } from "../../helpers/gameHelpers";
import type { ICollectionItem, IGame } from "../../models/game";
import type { ICollectionRecord, IGameFilter } from "../../services/api/DTO/gamesDTO";
import { loadGamesCategory as loadGamesCategoryReq } from "../../services/api/requests/games";
import { useRootStore } from "../root";
import { useGamesCommon } from "./gamesStore";
import { defaultCollection } from "./helpers/games";

const DEFAULT_COLLECTION_NAME = "default";

export const useGamesCategory = defineStore("gamesCategory", () => {
    const collections = ref<ICollectionRecord>({});
    const { getUserGeo } = toRefs(useMultilang());
    const { getIsLogged, getUserCurrency } = storeToRefs(useUserInfo());

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
        return collection?.data.slice(startPage * DEFAULT_PAGE_LIMIT, page * DEFAULT_PAGE_LIMIT) || [];
    };

    const getCollectionPagination = (slug: string = DEFAULT_COLLECTION_NAME): ICollectionItem["pagination"] | undefined => {
        return collections.value[categoryGeo(slug)]?.pagination;
    };

    const getCollectionFullData = (slug: string = DEFAULT_COLLECTION_NAME): ICollectionItem | undefined => {
        return collections.value[categoryGeo(slug)];
    };

    const isLoaded = (slug: string, page: number): boolean => {
        const collection = collections.value[slug];
        return (page === 1 && collection?.data.length) ||
            collection?.pagination.next_page === null ||
            page > collection?.pagination.next_page ||
            collection?.pagination.current_page >= page;
    };

    function setData(data: ICollectionItem, slug: string): void {
        const propsGame = { ...data };
        propsGame.data = data.data.map(processGameForNewAPI);
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

            const device = isMobile.value ? "mobile" : "desktop";

            const reqConfig: IGameFilter = {
                device,
                filter: {
                    categories: {
                        identifiers: [ slugCollection ],
                        strategy: "OR",
                    },
                },
                page,
                page_size: DEFAULT_PAGE_LIMIT,
            };

            const data = await loadGamesCategoryReq(reqConfig);
            setData(data, slugCollection);
        } catch (err) {
            log.error("LOAD_GAMES_CATEGORY_ERROR", err);
        }
    }

    function getRandomGameByCategory(slugCategory: string) {
        const gamesCollection = getCollection(slugCategory, 100);
        const isLogged = getIsLogged.value;
        const userCurrency = getUserCurrency.value;

        const filteredGames = gamesCollection.filter((game) => {
            if (isLogged) {
                return game.real?.[userCurrency];
            }
            return true;
        });

        return getRandomGame(filteredGames, !isLogged);
    }

    return {
        collections,

        categoryGeo,
        getCollection,
        getCollectionFullData,
        getCollectionPagination,
        getRandomGameByCategory,
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
