import { useUserInfo } from "@store/user/userInfo";
import { defineStore, type Pinia, storeToRefs } from "pinia";
import { computed, ref } from "vue";

import log from "../../controllers/Logger";
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

    const getRecentGames = computed(() => {
        const tempGames: IGame[] = [];
        for (const [ id, game ] of Object.entries(recentGames.value)) {
            tempGames.push(processGame(game, id));
        }

        return tempGames.sort(({ last_activity_at: lastActivityItem }, { last_activity_at: lastActivityNextItem }) => {
            return new Date(lastActivityNextItem).getTime() - new Date(lastActivityItem).getTime();
        });
    });

    function getGameCategoryNameBySlug(slug: string): string {
        const category = gamesCategories.value.find((categoryObj) => {
            return categoryObj.slug === slug;
        });

        return category ? category.name : "";
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
        categoryNavIsActive,
        gameLimits,
        recentGames,
        gamesJackpots,

        getGamesCategories,
        getRecentGames,
        getGameCategoryNameBySlug,
        getGamesJackpots,
        getJackpotTotalByCurrency,

        setGameToCache,
        getGameFromCache,

        loadGamesJackpots,
        loadLastGames,
        loadGamesCategories,
        clearRecentGames,
    };
});

export function useGamesCommonFetchService(pinia?: Pinia) {
    const { loadGamesCategories } = useGamesCommon(pinia);

    return {
        loadGamesCategories,
    };
}
