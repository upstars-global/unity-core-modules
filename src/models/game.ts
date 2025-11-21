export enum GameDevices {
    DESKTOP = "desktop",
    MOBILE = "mobile",
}

interface IGameCurrencies {
    [key: string]: {
        id: number;
        jackpot: null;
    };
}

export type GameFavoriteIds = number[];

export interface IGame {
    title: string;
    uniq_seo_title: false;
    lines: number;
    ways: null;
    volatility_rating: string;
    hit_rate: string;
    payout: string;
    currencies: IGameCurrencies;
    categories: string[];
    identifier: string;
    seo_title: string;
    devices: GameDevices;
    unfinished_games_for: [];
    provider: string;
    preview?: string;
    slug: string;
    has_demo_mode: boolean;
    total_count: number;
}

export interface IGamesProvider {
    id: string;
    title: string;
    provider: string;
    slug: string;
    url: string;
    name: string;
}

export enum GameDisableGeoStatus {
    all = "all",
}

export interface IDisabledGamesProvider {
    [key: string]: GameDisableGeoStatus.all | string[];
}

export interface IEnabledGames {
    [key: string]: string[];
}

export type IGamesProviderCollection = Record<string, IGamesProvider>;

export interface ICollectionItem {
    data: IGame[];
    pagination: {
        current_page: number;
        next_page: undefined;
        prev_page: undefined;
        total_pages: number;
        total_count: number;
    };
}

export enum ProvidersNames {
    evolution = "evolution",
    pragmaticplay = "pragmaticplay",
}

export type ICollections = Record<string, ICollectionItem>;

export default {};
