import { getGameImagePath } from "@helpers/gameImage";
import { SlugCategoriesGames } from "@theme/configs/categoryesGames";
import featureFlags from "@theme/configs/featureFlags";
import { storeToRefs } from "pinia";

import type { ICollectionItem, IDisabledGamesProvider, IGame, IGamesProvider } from "../models/game";
import { GameDisableGeoStatus, IEnabledGames } from "../models/game";
import { useCommon } from "../store/common";
import { useContextStore } from "../store/context";
import { useRootStore } from "../store/root";

type IFindGameParams = {
    producer: string;
    seoTitle: string;
};

interface IGameBadge {
    [key: string]: string;
}

interface IGameReal {
    id: number;
    jackpot?: number;
}

enum screenTypes {
    Desktop = "desktop",
    Mobile = "mobile",
}

export interface IGameItem extends IGame {
    id: string | number;
    preview: string;
    slug: string;
    name: string;
    badges: IGameBadge[];
    categories: string[];
    has_demo_mode: boolean;
    real: IGameReal;
    demo: number;
    gameSlug: string;
}

export interface IGameItemFilter {
    uniq_seo_title: boolean;
    lines: null;
    ways: number;
    volatility_rating: string;
    hit_rate: string;
    payout: string;
    categories: string[];
    identifier: string;
    seo_title: string;
    devices: screenTypes[];
    unfinished_games_for: [];
    currencies: {
        [key: string]: IGameReal,
    };
    title: string;
    provider: string;
}

export interface IParamsUrlGame {
    name: string;
    producer: string;
}

function findGameBySeoTittleAndProducerWithDuplicate(
    gamesCollection: IGame[],
    { producer, seoTitle }: IFindGameParams,
): IGame | undefined {
    const rootStore = useRootStore();
    return gamesCollection
        .filter((game: IGame) => {
            return game.devices.length > 1 ||
                game.devices.includes(rootStore.isMobile ? "mobile" : "desktop");
        })
        .find(({ seo_title: seoTitleItem, provider: providerItem }) => {
            return producer === providerItem && seoTitleItem === seoTitle;
        });
}

export function findGameBySeoTittleAndProducer(
    gamesCollection: IGame[],
    { producer, seoTitle }: IFindGameParams,
): IGame | undefined {
    return findGameBySeoTittleAndProducerWithDuplicate(gamesCollection, { producer, seoTitle });
}

export function defaultCollection(): ICollectionItem {
    return {
        data: [],
        pagination: {
            current_page: 0,
            next_page: undefined,
            prev_page: undefined,
            total_pages: 0,
            total_count: 0,
        },
    };
}

function getCountryCode(): string | undefined {
    const { currentIpInfo } = storeToRefs(useCommon());
    return currentIpInfo.value?.country_code;
}

export function isProviderAllowed(
    providerId: string,
    disabledMap: Record<string, GameDisableGeoStatus | string[]> | undefined,
    country?: string,
): boolean {
    if (!disabledMap) {
        return true;
    }
    const rules = disabledMap[providerId];
    if (!rules) {
        return true;
    }
    if (rules === GameDisableGeoStatus.all) {
        return false;
    }
    if (Array.isArray(rules)) {
        return !rules.includes(String(country));
    }
    return true;
}

export function isGameAllowed(
    identifier: string,
    enabledMap: IEnabledGames | undefined,
    country?: string,
): boolean {
    if (!enabledMap) {
        return true;
    }
    const whitelist = enabledMap[identifier];
    if (Array.isArray(whitelist)) {
        return whitelist.includes(String(country));
    }
    return true;
}

export function filterProviders(
    data: IGamesProvider[],
    disabledGamesProviders: IDisabledGamesProvider,
): IGamesProvider[] {
    const { isBotUA } = storeToRefs(useContextStore());


    if (!Array.isArray(data) || featureFlags.enableAllProviders || isBotUA.value) {
        return data;
    }

    const disabledMap = disabledGamesProviders;
    if (!disabledMap || Object.keys(disabledMap).length === 0) {
        return data;
    }

    const country = getCountryCode();
    return data.filter((item) => isProviderAllowed(item.provider, disabledMap, country));
}

export function filterGames<T extends IGame | IGameItem>(
    data: T[],
    disabledGamesProviders: IDisabledGamesProvider,
    enabledGamesConfig: IEnabledGames,
): T[] {
    const { isBotUA } = storeToRefs(useContextStore());

    if (!Array.isArray(data) || featureFlags.enableAllProviders || isBotUA.value) {
        return data;
    }

    const disabledMap = disabledGamesProviders;
    const enabledMap = enabledGamesConfig;
    const hasConfigs =
        Boolean(disabledMap && Object.keys(disabledMap).length) ||
        Boolean(enabledMap && Object.keys(enabledMap).length);

    if (!hasConfigs) {
        return data;
    }

    const country = getCountryCode();
    return data.filter(
        (game) =>
            isProviderAllowed(game.provider, disabledMap, country) &&
            isGameAllowed(game.identifier, enabledMap as IEnabledGames | undefined, country),
    );
}

export function isLoaded(collection: ICollectionItem, page: number) {
    return Boolean(collection) && ((page === 1 && collection.data.length) ||
            collection.pagination.next_page === null ||
            page > collection.pagination.next_page ||
            collection.pagination.current_page >= page);
}

export function processGame(game, gameKey): IGameItem {
    const gameCategoriesWithoutGeo: Record<string, number> = {};
    Object.entries(game.collections || {}).forEach(([ key, value ]) => {
        const categoryName = key.split(":")[0];
        gameCategoriesWithoutGeo[categoryName] = value as number;
    });

    const badges = [] as IGameBadge[];
    if (gameCategoriesWithoutGeo[SlugCategoriesGames.SLUG_CATEGORY_TOP] > -1) {
        badges.push({ type: SlugCategoriesGames.SLUG_CATEGORY_TOP });
    }
    if (gameCategoriesWithoutGeo[SlugCategoriesGames.SLUG_CATEGORY_NEW] > -1) {
        badges.push({ type: SlugCategoriesGames.SLUG_CATEGORY_NEW });
    }
    if (gameCategoriesWithoutGeo[SlugCategoriesGames.SLUG_CATEGORY_BONUS_WAGERING] > -1) {
        badges.push({ type: SlugCategoriesGames.SLUG_CATEGORY_BONUS_WAGERING });
    }
    if (featureFlags.enableMysticJackpots &&
        gameCategoriesWithoutGeo[SlugCategoriesGames.SLUG_CATEGORY_MYSTIC_JACKPOTS] > -1) {
        badges.push({ type: SlugCategoriesGames.SLUG_CATEGORY_MYSTIC_JACKPOTS });
    }
    if (gameCategoriesWithoutGeo[SlugCategoriesGames.SLUG_CATEGORY_JACKPOT] > -1) {
        badges.push({ type: SlugCategoriesGames.SLUG_CATEGORY_JACKPOT });
    }

    const [ , title ] = gameKey.split("/");

    return {
        ...game,
        id: title,
        name: game.title,
        slug: gameKey,
        preview: getGameImagePath(gameKey),
        has_demo_mode: hasGameDemo(game),
        badges,
    };
}

export function processGameForNewAPI(game: IGameItemFilter): IGameItem {
    const real = {};
    Object.entries(game.currencies)
        .forEach(([ keyReal, valueReal ]: [ string, IGameReal ]) => {
            real[keyReal] = valueReal.id;
        });

    const mainFormatGame = {
        ...game,
        collections: game.categories.reduce((accum, currentItem) => {
            return { ...accum, [currentItem]: 1 };
        }, {}),
        real,
        ...(game.currencies.FUN ? { demo: game.currencies.FUN.id } : {}),
        gameSlug: game.identifier,
    };

    return processGame(mainFormatGame, game.identifier);
}

export function hasGameDemo(game: IGame): boolean {
    return Boolean(game.currencies.FUN?.id) && !game.categories.includes(SlugCategoriesGames.SLUG_CATEGORY_LIVE);
}

export function paramsUrlGamePage(game: IGame): IParamsUrlGame {
    return {
        name: game.seo_title,
        producer: game.provider,
    };
}

export const getGameTemplates = (countSkeleton = 15): IGameItem[] => {
    const games: IGameItem[] = [];

    for (let i = 1; i <= countSkeleton; i++) {
        games.push({
            id: i,
            preview: "",
            slug: "",
            name: "",
            badges: [],
            currencies: {
                id: 0,
            },
            categories: [],
            title: "",
        });
    }

    return games;
};
