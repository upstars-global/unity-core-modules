import { CompPointRatesTypes } from "../../../models/enums/compPoints";

export interface IExchange {
    points: number;
    currency: string;
    group: string;
}

export interface IRate {
    points: number;
    currency: string;
    amount_cents: number;
}

export interface IExchangeMoneyRate {
    group: string;
    title: string;
    wager: number;
    rates: IRate[];
}

export interface ICompPoints {
    chargeable: {
        points: number;
    };
    persistent: {
        points: number;
    };
}

export type IExchangeMoneyRateList = IExchangeMoneyRate[];
export interface IMoneyRate {
    points: number;
    currency: string;
    amount_cents: number;
}
export interface IRedeemableCards {
    group: string;
    title: string;
    type: CompPointRatesTypes;
    rate: {
        points: number;
        freespins_count?: any;
    };
    rates: IMoneyRate[];
    games: string[];
}
