import type {
    IPlayaCategoryGames,
    IPlayaRecommendationGame,
    IPlayaRecommendations,
} from "../DTO/playaDTO";

interface IPlayaApiResponse<T> {
    data: T;
}

interface IPlayaClientConfig {
    apiKey: string;
    baseUrl: string;
    fetcher?: typeof fetch;
}

export class PlayaApiError extends Error {
    readonly status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

export class PlayaApiClient {
    private readonly apiKey: string;
    private readonly baseUrl: string;
    private readonly fetcher: typeof fetch;

    constructor({ apiKey, baseUrl, fetcher = fetch }: IPlayaClientConfig) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl.replace(/\/$/, "");
        this.fetcher = fetcher;
    }

    getGuestRecommendations(): Promise<IPlayaRecommendations> {
        return this.request("/v1/recommendations/guest");
    }

    getPlayerRecommendations(playerId: string): Promise<IPlayaRecommendations> {
        return this.request("/v1/recommendations/player", { "X-Player-ID": playerId });
    }

    getGuestCategoryGames(categoryId: string, page?: number): Promise<IPlayaCategoryGames> {
        return this.getCategoryGames(`/v1/recommendations/guest/categories/${ encodeURIComponent(categoryId) }/games`, page);
    }

    getPlayerCategoryGames(categoryId: string, playerId: string, page?: number): Promise<IPlayaCategoryGames> {
        return this.getCategoryGames(
            `/v1/recommendations/player/categories/${ encodeURIComponent(categoryId) }/games`,
            page,
            { "X-Player-ID": playerId },
        );
    }

    private getCategoryGames(path: string, page?: number, headers?: Record<string, string>): Promise<IPlayaCategoryGames> {
        const query = page ? `?page=${ page }` : "";
        return this.request(`${ path }${ query }`, headers);
    }

    private async request<T>(path: string, headers?: Record<string, string>): Promise<T> {
        const response = await this.fetcher(`${ this.baseUrl }${ path }`, {
            headers: {
                "X-API-Key": this.apiKey,
                ...headers,
            },
        });

        const payload = await response.json().catch(() => undefined) as IPlayaApiResponse<T> | undefined;

        if (!response.ok) {
            throw new PlayaApiError(response.status, response.statusText);
        }

        return payload?.data as T;
    }
}

export type { IPlayaRecommendationGame };
