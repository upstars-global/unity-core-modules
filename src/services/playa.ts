import { log } from "../controllers/Logger";
import { filterGames, type IGameItem, type IGameItemFilter, processGameForNewAPI } from "../helpers/gameHelpers";
import { useGamesCategory } from "../store/games/gamesCategory";
import { useGamesProviders } from "../store/games/gamesProviders";
import { useGamesCommon } from "../store/games/gamesStore";
import { useRootStore } from "../store/root";
import { loadGamesByIdsReq, loadGamesDataByFilter, loadPlayaRecommendationsReq } from "./api/requests/games";

export interface IPlayaGamesPage {
    games: IGameItem[];
    nextPage: number | null;
}

function getDevice() {
    return useRootStore().isMobile ? "mobile" : "desktop";
}

function catalogueCards(games: IGameItemFilter[]) {
    return filterGames(
        games.map(processGameForNewAPI),
        useGamesProviders().disabledGamesProviders,
        useGamesCommon().enabledGamesConfig,
    );
}

async function loadPlayaCards(gameIds: string[]) {
    if (!gameIds.length) {
        return [];
    }

    const cards: Record<string, IGameItemFilter & { is_geo_available?: boolean }> = await loadGamesByIdsReq(gameIds, getDevice());
    const games = gameIds.flatMap((id) => {
        const game = cards[id];
        return game?.identifier && game.is_geo_available !== false ? [ game ] : [];
    });
    return catalogueCards(games);
}

export async function loadPlayaPage(page: number, limit: number): Promise<IPlayaGamesPage | undefined> {
    try {
        const { gameIds, pagination } = await loadPlayaRecommendationsReq(page, limit);
        return {
            games: await loadPlayaCards(gameIds),
            nextPage: pagination.page * pagination.limit < pagination.total ? pagination.page + 1 : null,
        };
    } catch (error) {
        log.error("LOAD_PLAYA_TOP_ERROR", error);
    }
}

export async function loadPlayaFallbackPage(slug: string, page: number, limit: number): Promise<IPlayaGamesPage | undefined> {
    try {
        const { data, pagination } = await loadGamesDataByFilter<{
            data?: IGameItemFilter[];
            pagination?: { next_page: number | null };
        }>({
            device: getDevice(),
            filter: { categories: { identifiers: [ useGamesCategory().categoryGeo(slug) ], strategy: "OR" } },
            page,
            page_size: limit,
        });

        if (Array.isArray(data)) {
            return { games: catalogueCards(data), nextPage: pagination?.next_page ?? null };
        }
    } catch (error) {
        log.error("LOAD_PLAYA_TOP_CATALOGUE_ERROR", error);
    }
}
