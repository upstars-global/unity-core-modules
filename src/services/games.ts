import { SlugCategoriesGames } from "@theme/configs/categoryesGames";
import { storeToRefs } from "pinia";

import { log } from "../controllers/Logger";
import { isExistData } from "../helpers/isExistData";
import { IRecentGames } from "../models/game";
import { useGamesCommon } from "../store/games/gamesStore";
import { useJackpots } from "../store/jackpots";
import { useRootStore } from "../store/root";
import { loadEnabledGamesConfigReq } from "./api/requests/configs";
import {
    loadCategoriesFileConfigRequest,
    loadFilteredGames as loadFilteredGamesReq,
    loadGamesCategories as loadGamesCategoriesReq,
    loadGamesJackpots as loadGamesJackpotsReq,
    loadLastGames as loadLastGamesReq,
} from "./api/requests/games";

export function getMenuCategoriesBySlug(slug: string): SlugCategoriesGames[] {
    const jackpotsStore = useJackpots();
    const gamesStore = useGamesCommon();

    return (
        gamesStore.menuGameCategories[slug] ||
    gamesStore.defaultMenuGameCategories[slug]
    ).filter((menuSlug: string) =>
        (menuSlug === SlugCategoriesGames.SLUG_CATEGORY_MYSTIC_JACKPOTS ? jackpotsStore.isTurnOnJPMystic : true));
}

export async function loadCategoriesFileConfig() {
    const gamesStore = useGamesCommon();

    if (Object.keys(gamesStore.menuGameCategories).length > 0) {
        return gamesStore.menuGameCategories;
    }

    const data = await loadCategoriesFileConfigRequest();

    if (data) {
        gamesStore.setMenuGameCategories(data);
    }
}

export async function loadEnableGamesConfig() {
    const gamesStore = useGamesCommon();
    const data = await loadEnabledGamesConfigReq();

    if (data) {
        gamesStore.setEnableGamesConfig(data);
    }
}

export async function loadGamesJackpots(): Promise<void> {
    try {
        const gamesStore = useGamesCommon();
        const jackpots = await loadGamesJackpotsReq();

        gamesStore.setGamesJackpots(jackpots);
    } catch (error) {
        log.error("Error loading games jackpots", error);
    }
}

export async function loadLastGames(): Promise<void> {
    try {
        const lastGamesList = await loadLastGamesReq();

        if (!lastGamesList.length) {
            return;
        }

        const gamesMap: IRecentGames = {};
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
        const recentGames: IRecentGames = {};

        for (const gameIdentifier in recentGamesResponse) {
            if (recentGamesResponse[gameIdentifier]) {
                recentGames[gameIdentifier] = {
                    ...(gamesMap[gameIdentifier] || {}),
                    ...recentGamesResponse[gameIdentifier],
                };
            }
        }

        const gamesStore = useGamesCommon();

        gamesStore.setRecentGames(recentGames);

        log.info("RECENT_GAMES_LOADED", recentGames);
    } catch (error) {
        log.error("LOAD_LAST_GAMES", error);
    }
}

export async function loadGamesCategories(): Promise<void> {
    try {
        const gamesStore = useGamesCommon();
        const { gamesCategories } = storeToRefs(gamesStore);

        if (isExistData(gamesCategories.value)) {
            return;
        }

        const data = await loadGamesCategoriesReq();

        const gamesCategoriesMap = data.map((category) => {
            return {
                ...category,
                provider: category.id,
                slug: category.id,
                url: `/games/${category.id}`,
                name: category.title,
            };
        });

        gamesStore.setGamesCategories(gamesCategoriesMap);
    } catch (error) {
        log.error("LOAD_GAMES_CATEGORIES", error);
    }
}
