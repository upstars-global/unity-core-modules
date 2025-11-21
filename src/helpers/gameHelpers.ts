import { getGameImagePath } from "@helpers/gameImage";
import { SlugCategoriesGames } from "@theme/configs/categoryesGames";
import featureFlags from "@theme/configs/featureFlags";

import { log } from "../controllers/Logger";
import type { IGame } from "../models/game";
import { loadRandomGame } from "../services/api/requests/games";
import { filterGames } from "../store/games/helpers/games";

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

let randomGameCounter = 0;
export async function getRandomGame(category?: string): Promise<IGame | undefined> {
    const randomGame = await loadRandomGame({ identifier: category });
    randomGameCounter++;

    const isValidRandomGame = filterGames([ randomGame ])?.length;

    if (isValidRandomGame) {
        randomGameCounter = 0;
        return randomGame;
    }

    if (randomGameCounter <= 10) {
        return getRandomGame(category);
    }

    if (randomGameCounter > 10) {
        log.error("LOAD_RANDOM_GAME_ERROR", "Repeated 10 times, didn`t find an acceptable random game");
    }

    randomGameCounter = 0;
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
