import { CONFIG_DEFAULT_COLLECTIONS_MENU_SLUGS, SlugCategoriesGames } from "@theme/configs/categoryesGames";
import { defineStore, storeToRefs } from "pinia";
import { computed, ref } from "vue";

import { currencyView } from "../../helpers/currencyHelper";
import { processGame } from "../../helpers/gameHelpers";
import { filterGames, findGameBySeoTittleAndProducer } from "../../helpers/gameHelpers";
import type { IGame, IGamesProvider, IRecentGames } from "../../models/game";
import { IEnabledGames } from "../../models/game";
import { type IJackpots } from "../../services/api/DTO/gamesDTO";
import { useConfigStore } from "../configStore";
import { useUserInfo } from "../user/userInfo";

interface ISearchCachedGameKey {
    seoTitle?: string;
    producer?: string;
    identifier?: string;
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
    const userInfoStore = useUserInfo();
    const { getUserCurrency } = storeToRefs(userInfoStore);
    const getGamesCategories = computed(() => gamesCategories.value);
    const menuGameCategories = ref<Record<string, SlugCategoriesGames[]>>({});
    const defaultMenuGameCategories = ref<Record<string, SlugCategoriesGames[]>>(CONFIG_DEFAULT_COLLECTIONS_MENU_SLUGS);
    const enabledGamesConfig = ref<IEnabledGames>({});
    const { disabledGamesProviders } = storeToRefs(useConfigStore());

    const getRecentGames = computed(() => {
        let tempGames = [];
        for (const [ id, game ] of Object.entries(recentGames.value)) {
            tempGames.push(processGame(game, id));
        }

        tempGames = filterGames(
            tempGames,
            disabledGamesProviders.value,
            enabledGamesConfig.value,
        );

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
        const userCurrency = getUserCurrency.value;
        const gamesJackpotsVal = getGamesJackpots.value;

        const totalJackpot = Object.values(gamesJackpotsVal).reduce((prevValue, currentValue) => {
            return prevValue + currentValue;
        }, 0);

        return currencyView(totalJackpot, userCurrency, null, userInfoStore.getSubunitsToUnitsByCode(), 2);
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

    function clearRecentGames(): void {
        recentGames.value = {};
    }

    function setEnableGamesConfig(list: IEnabledGames) {
        enabledGamesConfig.value = list;
    }

    function setGamesJackpots(jackpots: IJackpots): void {
        gamesJackpots.value = jackpots;
    }

    function setRecentGames(gamesList: IRecentGames): void {
        recentGames.value = gamesList;
    }

    function setGamesCategories(categories: IGamesProvider[]): void {
        gamesCategories.value = categories;
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
        enabledGamesConfig,

        setDefaultOptions,
        setMenuGameCategories,
        setGameToCache,
        getGameFromCache,

        clearRecentGames,
        setEnableGamesConfig,
        setGamesJackpots,
        setGamesCategories,
        setRecentGames,
    };
});
