import { storeToRefs } from "pinia";

import {
    filterGames,
    type IGameItem,
    type IGameItemFilter,
    processGameForNewAPI,
} from "../helpers/gameHelpers";
import { useGamesProviders } from "../store/games/gamesProviders";
import { useGamesCommon } from "../store/games/gamesStore";
import type { IPlayaRecommendationCategory, IPlayaRecommendations } from "./api/DTO/playaDTO";
import { loadPlayaCategoryGamesReq, loadPlayaRecommendationsReq } from "./api/requests/playa";

function processCategory(
    category: IPlayaRecommendationCategory<IGameItemFilter>,
): IPlayaRecommendationCategory<IGameItem> {
    const { disabledGamesProviders } = storeToRefs(useGamesProviders());
    const { enabledGamesConfig } = storeToRefs(useGamesCommon());

    return {
        ...category,
        games: filterGames(
            category.games.map(processGameForNewAPI),
            disabledGamesProviders.value,
            enabledGamesConfig.value,
        ),
    };
}

export async function loadPlayaRecommendations(): Promise<IPlayaRecommendations<IGameItem> | undefined> {
    const recommendations = await loadPlayaRecommendationsReq();

    if (!recommendations) {
        return;
    }

    return {
        ...recommendations,
        categories: recommendations.categories
            .map(processCategory)
            .filter(({ games }) => games.length),
    };
}

export async function loadPlayaCategory(
    categoryId: string,
): Promise<IPlayaRecommendationCategory<IGameItem> | undefined> {
    const categoryGames = await loadPlayaCategoryGamesReq(categoryId);

    return categoryGames ? processCategory(categoryGames.data) : undefined;
}
