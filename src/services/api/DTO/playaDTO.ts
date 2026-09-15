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
    current_page: number;
    next_page: number | null;
    prev_page: number | null;
    total_pages: number;
    total_count: number;
}

export interface IPlayaCategoryGames<TGame = IPlayaRecommendationGame> {
    data: TGame[];
    pagination: IPlayaPagination;
}
