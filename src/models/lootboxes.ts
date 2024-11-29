import type { Currencies } from "./enums/currencies"

export enum EnumLootboxState {
    issued = "issued",
    activated = "activated",
    canceled = "canceled",
    expired = "expired",
}

export interface ILootboxLevel {
    amount_cents: number;
    available_amount_cents: number;
    current_award_value: null;
    id: number;
    identifier: string;
    index: number;
    name: string;
    periods: [];
    state: string;
    total_amount_cents: number;
    working_days: [];
}

export interface ILootbox {
    allowed_currencies: Currencies[];
    currency: Currencies;
    external_id: string;
    games: [];
    id: number;
    identifier: string;
    levels: ILootboxLevel[];
    name: string;
    stage: EnumLootboxState;
    title: string;
    group_key: string;
}
