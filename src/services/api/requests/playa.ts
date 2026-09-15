import { log } from "../../../controllers/Logger";
import type { IGameItemFilter } from "../../../helpers/gameHelpers";
import type { IPlayaCategoryGames, IPlayaRecommendations } from "../DTO/playaDTO";
import { http } from "../http";

export async function loadPlayaRecommendationsReq(): Promise<IPlayaRecommendations<IGameItemFilter> | undefined> {
    try {
        const { data } = await http().get<IPlayaRecommendations<IGameItemFilter>>("/api-fe/playa/recommendations");
        return data;
    } catch (error) {
        log.error("LOAD_PLAYA_RECOMMENDATIONS_ERROR", error);
    }
}

export async function loadPlayaCategoryGamesReq(
    categoryId: string,
    page?: number,
): Promise<IPlayaCategoryGames<IGameItemFilter> | undefined> {
    try {
        const params = page ? { page } : undefined;
        const { data } = await http().get<IPlayaCategoryGames<IGameItemFilter>>(
            `/api-fe/playa/recommendations/categories/${ encodeURIComponent(categoryId) }/games`,
            { params },
        );
        return data;
    } catch (error) {
        log.error("LOAD_PLAYA_CATEGORY_GAMES_ERROR", error);
    }
}
