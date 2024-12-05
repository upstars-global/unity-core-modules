import type { ICollectionItem } from "../../../models/game";

export interface IJackpots {
    [currency: string]: {
        [provider: string]: number;
    };
}

export interface IPlayedGame {
    identifier: string;
    last_activity_at: string | null;
}

export interface IGameCollection {
    id: string;
    title: string;
    games_count: number;
}

interface IFilter {
    currencies: string[];
    providers: string[];
    volatility_rating: Array<"low" | "low-medium" | "medium" | "medium-high" | "high" | "very-high">;
    lines: number;
    ways: number;
    hit_rate: number;
    payout: number;
    title: string;
    categories: {
        identifiers: string[];
        strategy: string;
    };
}

interface ISort {
    type: string;
    direction: "ASC" | "DESC";
    top_categories: string[];
}

export interface IGameFilter {
    device: string;
    page_size: number;
    page: number;
    without_territorial_restrictions: boolean;
    filter: IFilter;
    sort: ISort;
}

export type IGameFilterResponse = IGameFilter | object;

export interface ICollectionRecord {
    [slug: string]: ICollectionItem;
}
