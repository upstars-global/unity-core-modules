import { FE_API_PREFIX } from "../../../consts/apiConfig";
import { log } from "../../../controllers/Logger";
import type { IGameItemFilter } from "../../../helpers/gameHelpers";
import type { IPlayaCategoryGames, IPlayaRecommendations } from "../DTO/playaDTO";
import { http } from "../http";

export async function loadPlayaRecommendationsReq(): Promise<IPlayaRecommendations<IGameItemFilter> | undefined> {
    try {
        const { data } = await http().get<IPlayaRecommendations<IGameItemFilter>>(`${ FE_API_PREFIX }/playa/recommendations`);
        return data;
    } catch (error) {
        log.error("LOAD_PLAYA_RECOMMENDATIONS_ERROR", error);
    }
}

export async function loadPlayaCategoryGamesReq(
    categoryId: string,
): Promise<IPlayaCategoryGames<IGameItemFilter> | undefined> {
    try {
        const { data } = await http().get<IPlayaCategoryGames<IGameItemFilter>>(
            `${ FE_API_PREFIX }/playa/recommendations/categories/${ encodeURIComponent(categoryId) }/games`,
        );
        return data;
    } catch (error) {
        log.error("LOAD_PLAYA_CATEGORY_GAMES_ERROR", error);
    }
}
