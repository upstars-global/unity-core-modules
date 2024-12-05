import type { Currencies } from "./cashbox";

export interface IJackpotLevel {
    amount_cents: number;
    available_amount_cents: number;
    current_award_value: number;
    id: number;
    identifier: string;
    index: number;
    name: string;
    periods: [];
    state: string;
    total_amount_cents: number;
    working_days: null;
}

export interface IJackpotItem {
    id: number;
    name: string;
    allowed_currencies: string[];
    currency: Currencies;
    external_id: string;
    games: string[];
    identifier: string;
    state: string;
    levels: IJackpotLevel[];
}
