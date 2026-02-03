import type { SlugCategoriesGames } from "@theme/configs/categoryesGames";

import { FE_API_PREFIX } from "../../../consts/apiConfig";
import { log } from "../../../controllers/Logger";
import type { IGame, IGamesProvider } from "../../../models/game";
import {
    AcceptGamesVersion,
    IGameCollection,
    IGameFilterResponse,
    IJackpots,
    IPlayedGame,
    IRandomGameFilter,
    ResponseGamesByVersion,
} from "../DTO/gamesDTO";
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

export async function loadRandomGame(config: IRandomGameFilter): Promise<IGame> {
    try {
        const query = Object.entries(config)
            .filter(([ , value ]) => value !== undefined && value !== null)
            .map(([ key, value ]) => `${ encodeURIComponent(key) }=${ encodeURIComponent(String(value)) }`)
            .join("&");

        const { data } = await http().get<IGame>(`/api/games/random${ query ? `?${ query }` : "" }`);
        return data;
    } catch (error) {
        log.error("LOAD_RANDOM_GAME_ERROR", error);
        return {} as IGame;
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

export async function loadGamesDataByFilter<T>(config: Record<string, unknown>): Promise<T> {
    try {
        const { data } = await http().post<T>("/api/games_filter", config);
        return data;
    } catch (error) {
        log.error("LOAD_GAMES_CATEGORY_ERROR", error);
        return {} as T;
    }
}

export async function loadGamesProvidersReq() {
    try {
        const { data } = await http().get<IGamesProvider[]>("/api/games/providers");
        return data;
    } catch (error) {
        log.error("LOAD_GAMES_PROVIDERS_ERROR", error);
        return [] as IGamesProvider[];
    }
}

export async function loadCategoriesFileConfigRequest() {
    try {
        const { data } = await http().get<Record<string, SlugCategoriesGames[]>>(`${ FE_API_PREFIX }/config/menu-categories-games`);

        return data;
    } catch (err) {
        log.error("LOAD_CATEGORIES_PAGE_FILE_CONFIG_ERROR", err);
        throw err;
    }
}

export async function fetchFavoriteGames<V extends AcceptGamesVersion>(version: V): Promise<ResponseGamesByVersion<V>> {
    try {
        const headers = { "accept-client": version } as const;
        const { data } = await http({ headers })
            .get<ResponseGamesByVersion<V>>("/api/player/favorite_games");
        return data;
    } catch (err) {
        log.error("FETCH_FAVORITE_GAMES_ERROR", err);
        throw err;
    }
}

export async function fetchAddFavoriteGamesCount(idGame: number): Promise<void> {
    try {
        return await http({ auth: true }).put(`/api/player/favorite_games/${ idGame }`);
    } catch (err) {
        log.error("FETCH_FAVORITE_GAMES_COUNT_ERROR", err);
    }
}

export async function fetchDeleteGameFromFavorites(idGame: number): Promise<void> {
    try {
        return await http({ auth: true }).delete(`/api/player/favorite_games/${ idGame }`);
    } catch (err) {
        log.error("FETCH_DELETE_GAME_FROM_FAVORITES_ERROR", err);
    }
}
