import { CONFIG_DEFAULT_COLLECTIONS_MENU_SLUGS } from "@theme/configs/categoryesGames";
import { SlugCategoriesGames } from "@theme/configs/categoryesGames";
import { defineStore, type Pinia, storeToRefs } from "pinia";
import { computed, ref } from "vue";

import { log } from "../../controllers/Logger";
import { currencyView } from "../../helpers/currencyHelper";
import { processGame } from "../../helpers/gameHelpers";
import type { IGame, IGamesProvider } from "../../models/game";
import {
    loadFilteredGames as loadFilteredGamesReq,
    loadGamesCategories as loadGamesCategoriesReq,
    loadGamesJackpots as loadGamesJackpotsReq,
    loadLastGames as loadLastGamesReq,
} from "../../services/api/requests/games";
import { useRootStore } from "../root";
import { useUserInfo } from "../user/userInfo";
import { findGameBySeoTittleAndProducer } from "./helpers/games";


interface ISearchCachedGameKey {
    seoTitle?: string;
    producer?: string;
    identifier?: string;
}

interface IRecentGames {
    [key: string]: IGame;
}

interface IJackpots {
    [currency: string]: number;
}

interface IGamesCommonStoreDefaultOptions {
  defaultMenuGameCategories: Record<string, SlugCategoriesGames[]>;
}

export const useGamesCommon = defineStore("gamesCommon", () => {
    const gamesDataCached = ref<Record<string, IGame>>({});
    const games = ref<IGame[]>([]);
    const gamesCategories = ref<IGamesProvider[]>([]);
    const categoryNavIsActive = ref<number>(0);
    const gameLimits = ref<Record<string, number>>({});
    const recentGames = ref<IRecentGames>({});
    const gamesJackpots = ref<IJackpots>({});
    const { getUserCurrency } = storeToRefs(useUserInfo());
    const getGamesCategories = computed(() => gamesCategories.value);
    const menuGameCategories = ref<Record<string, SlugCategoriesGames[]>>({});
    const defaultMenuGameCategories = ref<Record<string, SlugCategoriesGames[]>>(CONFIG_DEFAULT_COLLECTIONS_MENU_SLUGS);

    const getRecentGames = computed(() => {
        const tempGames: IGame[] = [];
        for (const [ id, game ] of Object.entries(recentGames.value)) {
            tempGames.push(processGame(game, id));
        }

        return tempGames.sort(({ last_activity_at: lastActivityItem }, { last_activity_at: lastActivityNextItem }) => {
            return new Date(lastActivityNextItem).getTime() - new Date(lastActivityItem).getTime();
        });
    });

    function setDefaultOptions(options: IGamesCommonStoreDefaultOptions): void {
        defaultMenuGameCategories.value = options.defaultMenuGameCategories;
    }

    function getGameCategoryNameBySlug(slug: string): string {
        const category = gamesCategories.value.find((categoryObj) => {
            return categoryObj.slug === slug;
        });

        return category ? category.name : "";
    }

    function setMenuGameCategories(categories: Record<string, SlugCategoriesGames[]>): void {
        menuGameCategories.value = categories;
    }

    const getGamesJackpots = computed(() => {
        const userCurrency = getUserCurrency.value;
        return gamesJackpots.value[userCurrency] || {};
    });

    const getJackpotTotalByCurrency = computed(() => {
        const { getSubunitsToUnitsByCode: subUnits } = useUserInfo();

        const userCurrency = getUserCurrency.value;
        const gamesJackpotsVal = getGamesJackpots.value;

        const totalJackpot = Object.values(gamesJackpotsVal).reduce((prevValue, currentValue) => {
            return prevValue + currentValue;
        }, 0);

        return currencyView(totalJackpot, userCurrency, null, subUnits(), 2);
    });

    function setGameToCache(game: IGame): void {
        gamesDataCached.value[game.identifier] = game;
    }

    function getGameFromCache({ seoTitle, identifier, producer }: ISearchCachedGameKey): IGame | undefined {
        if (identifier) {
            return gamesDataCached.value[identifier];
        }

        if (seoTitle) {
            return findGameBySeoTittleAndProducer(Object.values(gamesDataCached.value), { seoTitle, producer });
        }
    }

    async function loadGamesJackpots(): Promise<void> {
        try {
            gamesJackpots.value = await loadGamesJackpotsReq();
        } catch (error) {
            log.error("Error loading games jackpots", error);
        }
    }

    async function loadLastGames(): Promise<void> {
        try {
            const lastGamesList = await loadLastGamesReq();
            if (!lastGamesList.length) {
                return;
            }

            const gamesMap: Record<string, IGame> = {};
            const game_ids: string[] = [];
            lastGamesList.forEach((game) => {
                gamesMap[game.identifier] = game;
                game_ids.push(game.identifier);
            });

            const { isMobile } = storeToRefs(useRootStore());

            const requestConfig = {
                game_ids,
                device: isMobile.value ? "mobile" : "desktop",
            };

            const recentGamesResponse = await loadFilteredGamesReq(requestConfig);

            for (const gameIdentifier in recentGamesResponse) {
                if (recentGamesResponse[gameIdentifier]) {
                    recentGamesResponse[gameIdentifier] = {
                        ...(gamesMap[gameIdentifier] || {}),
                        ...recentGamesResponse[gameIdentifier],
                    };
                }
            }

            recentGames.value = recentGamesResponse;
            log.info("RECENT_GAMES_LOADED", recentGames.value);
        } catch (error) {
            log.error("LOAD_LAST_GAMES", error);
        }
    }

    async function loadGamesCategories(): Promise<void> {
        try {
            const data = await loadGamesCategoriesReq();
            gamesCategories.value = data.map((category) => {
                return {
                    ...category,
                    slug: category.id,
                    url: `/games/${category.id}`,
                    name: category.title,
                };
            });
        } catch (error) {
            log.error("LOAD_GAMES_CATEGORIES", error);
        }
    }

    function clearRecentGames(): void {
        recentGames.value = {};
    }

    return {
        gamesDataCached,
        games,
        gamesCategories,
        menuGameCategories,
        defaultMenuGameCategories,
        categoryNavIsActive,
        gameLimits,
        recentGames,
        gamesJackpots,

        getGamesCategories,
        getRecentGames,
        getGameCategoryNameBySlug,
        getGamesJackpots,
        getJackpotTotalByCurrency,

        setDefaultOptions,
        setMenuGameCategories,
        setGameToCache,
        getGameFromCache,

        loadGamesJackpots,
        loadLastGames,
        loadGamesCategories,
        clearRecentGames,
    };
});

export function useGamesCommonFetchService(pinia?: Pinia) {
    const { setDefaultOptions, loadGamesCategories } = useGamesCommon(pinia);


    return {
        loadGamesCategories,
    };
}
