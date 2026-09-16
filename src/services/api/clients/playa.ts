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

interface IPlayaCategoryGamesParams {
    country?: string;
    headers?: Record<string, string>;
    limit?: number;
    page?: number;
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

    getGuestRecommendations(country?: string): Promise<IPlayaRecommendations> {
        const query = country ? `?country=${ encodeURIComponent(country) }` : "";
        return this.request<IPlayaApiResponse<IPlayaRecommendations>>(`/v1/recommendations/guest${ query }`)
            .then(({ data }) => data);
    }

    getPlayerRecommendations(playerId: string): Promise<IPlayaRecommendations> {
        return this.request<IPlayaApiResponse<IPlayaRecommendations>>(
            "/v1/recommendations/player",
            { "X-Player-ID": playerId },
        ).then(({ data }) => data);
    }

    getGuestCategoryGames(categoryId: string, page?: number, country?: string, limit?: number): Promise<IPlayaCategoryGames> {
        return this.getCategoryGames(
            `/v1/recommendations/guest/categories/${ encodeURIComponent(categoryId) }/games`,
            { country, limit, page },
        );
    }

    getPlayerCategoryGames(categoryId: string, playerId: string, page?: number, limit?: number): Promise<IPlayaCategoryGames> {
        return this.getCategoryGames(
            `/v1/recommendations/player/categories/${ encodeURIComponent(categoryId) }/games`,
            { headers: { "X-Player-ID": playerId }, limit, page },
        );
    }

    private getCategoryGames(
        path: string,
        { country, headers, limit, page }: IPlayaCategoryGamesParams,
    ): Promise<IPlayaCategoryGames> {
        const params = new URLSearchParams();
        if (page) {
            params.set("page", String(page));
        }
        if (limit) {
            params.set("limit", String(limit));
        }
        if (country) {
            params.set("country", country);
        }
        const queryString = params.toString();
        const query = queryString ? `?${ queryString }` : "";
        return this.request(`${ path }${ query }`, headers);
    }

    private async request<T>(path: string, headers?: Record<string, string>): Promise<T> {
        const response = await this.fetcher(`${ this.baseUrl }${ path }`, {
            headers: {
                "X-API-Key": this.apiKey,
                ...headers,
            },
        });

        const payload = await response.json().catch(() => undefined) as T | undefined;

        if (!response.ok) {
            throw new PlayaApiError(response.status, response.statusText);
        }

        return payload as T;
    }
}

export type { IPlayaRecommendationGame };
