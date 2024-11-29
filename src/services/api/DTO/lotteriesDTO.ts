import type {Currencies} from "../../../models/enums/currencies";

interface ILotteriesPrizeItem {
    id: number;
    stuff: string;
    award_place: number;
    nickname: string | null;
    wager_multiplier: number;
    money_budget_percent: number;
    money_award: number;
    money_award_cents: number;
    chargeable_comp_points_percent: number;
    persistent_comp_points_percent: number;
    persistent_comp_points: number;
    chargeable_comp_points: number;
    freespins_count: number;
    ticket: string | null;
}

export interface ILotteriesItem {
    id: number;
    title: string;
    currency: string;
    frontend_identifier: string;
    in_progress: boolean;
    start_at: string;
    end_at: string;
    finished_at: string | null;
    chargeable_comp_points_budget: number;
    persistent_comp_points_budget: number;
    comp_points_ticket_price: number;
    money_budget: number;
    money_budget_cents: number;
    group_ids: number[];
    prizes: ILotteriesPrizeItem[];
    deposit_scale_rules: Record<
        Currencies,
        Array<{
            from_amount_cents: number;
            price_cents: number;
            currency: Currencies;
            active: boolean;
        }>
    >;
    max_tickets_count_to_player: number | null;
    lottery_tickets_count: number;
}

export type ILotteriesList = ILotteriesItem[];

export interface ILotteriesStatusesItem {
    lottery_id: number;
    tickets: [];
    prizes: ILotteriesPrizeItem;
}

export type ILotteriesStatusesList = ILotteriesStatusesItem[];
