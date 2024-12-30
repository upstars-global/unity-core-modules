import type { SlugCategoriesGames } from "@theme/configs/categoryesGames";

import log from "../../../controllers/Logger";
import type { IGame } from "../../../models/game";
import { useGamesCommon } from "../../../store/games/gamesStore";
import { IGameCollection, IGameFilterResponse, IJackpots, IPlayedGame } from "../DTO/gamesDTO";
import { http } from "../http";

export async function loadGamesJackpots(): Promise<IJackpots> {
    try {
        const { data } = await http().get<IJackpots>("/api/games/jackpots");
        return data;
    } catch (error) {
        log.error("LOAD_GAMES_JACKPOTS_ERROR", error);
        return {};
    }
}

export async function loadLastGames(): Promise<IPlayedGame[]> {
    try {
        const { data } = await http().get<IPlayedGame[]>("/api/player/played_games");
        return data;
    } catch (error) {
        log.error("LOAD_LAST_GAMES_ERROR", error);
        return [];
    }
}

export async function loadGamesCategories(): Promise<IGameCollection[]> {
    try {
        const { data } = await http().get<IGameCollection[]>("/api/games/collections");
        return data;
    } catch (error) {
        log.error("LOAD_GAMES_CATEGORIES_ERROR", error);
        return [];
    }
}

export async function loadFilteredGames(config: Record<string, unknown>): Promise<IGame[]> {
    try {
        const { data } = await http().post<IGame[]>("/api/games_filter/select", config);
        return data;
    } catch (error) {
        log.error("LOAD_FILTERED_GAMES_ERROR", error);
        return [];
    }
}

export async function loadGamesCategory(config: Record<string, unknown>): Promise<IGameFilterResponse> {
    try {
        const { data } = await http().post<IGameFilterResponse>("/api/games_filter", config);
        return data;
    } catch (error) {
        log.error("LOAD_GAMES_CATEGORY_ERROR", error);
        return {};
    }
}

export async function loadCategoriesFileConfigRequest() {
    try {
        const { data } = await http().get<Record<string, SlugCategoriesGames[]>>("/api/fe/config/menu-categories-games");

        return data;
    } catch (err) {
        log.error("LOAD_CATEGORIES_PAGE_FILE_CONFIG_ERROR", err);
        throw err;
    }
}
