import { log } from "../../../controllers/Logger";
import type { CompPointRatesTypes } from "../../../models/enums/compPoints";
import {
    type ICompPoints,
    type IExchange,
    type IExchangeMoneyRate,
    type IRedeemableCards,
} from "../DTO/compPoints";
import { http } from "../http";

export async function exchangeToMoneyReq(exchange: IExchange) {
    try {
        const { data } = await http().post<void>(
            "/api/comp_points/exchange/money",
            {
                exchange,
            });
        return data;
    } catch (err) {
        log.error("EXCHANGE_TO_MONEY_ERROR", err);
    }
}

export async function loadRatesMoneyReq() {
    try {
        const { data } = await http().get<IExchangeMoneyRate[]>("/api/comp_points/rates/money");

        return data;
    } catch (err) {
        log.error("LOAD_RATES_MONEY_ERROR", err);
    }
}

export async function loadUserCompPointsReq() {
    try {
        const { data } = await http().get<ICompPoints>("/api/player/comp_points");
        return data;
    } catch (err) {
        log.error("LOAD_USER_COMP_POINTS", err);
    }
}

export async function loadCompPointRateBySlug(slug: CompPointRatesTypes) {
    try {
        const { data } = await http().get<IRedeemableCards[]>(`/api/comp_points/rates/${slug}`);
        return data.map((item) => {
            return {
                ...item,
                type: slug,
            };
        });
    } catch (err) {
        log.error("LOAD_COMP-POINT_RATE", err);
    }
}

export async function exchangeCompPointRateBySlug(slug: string, payload: unknown) {
    try {
        const { data } = await http().post(`/api/comp_points/exchange/${slug}`, payload);
        return data;
    } catch (err) {
        log.error("EXCHANGE_COMP-POINT", err);
        throw err;
    }
}
