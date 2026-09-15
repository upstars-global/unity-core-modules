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

export interface IPlayaPagination {
    page: number;
    limit: number;
    total: number;
}

export interface IPlayaCategoryGames<TGame = IPlayaRecommendationGame> {
    data: IPlayaRecommendationCategory<TGame>;
    pagination: IPlayaPagination;
}
