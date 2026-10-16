export interface IPlayaRecommendationGame {
    id: string;
    name: string;
    provider: string;
}

export interface IPlayaRecommendationCategory<TGame = IPlayaRecommendationGame> {
    id: string;
    name: string;
    games: TGame[];
}

export interface IPlayaRecommendations<TGame = IPlayaRecommendationGame> {
    categories: IPlayaRecommendationCategory<TGame>[];
    resolved_country?: string;
}

export interface IPlayaCategoryGames<TGame = IPlayaRecommendationGame> {
    data: IPlayaRecommendationCategory<TGame>;
}
