import type { AxiosError } from "axios";

import { log } from "../../../controllers/Logger";
import { ILotteriesItem, ILotteriesList, ILotteriesStatusesItem, ILotteriesStatusesList } from "../DTO/lotteriesDTO";
import { http } from "../http";

export async function loadLotteriesListReq() {
    try {
        const { data } = await http().get<ILotteriesList>("/api/lotteries");
        return data;
    } catch (err: unknown) {
        log.error("LOAD_LOTTERIES_LIST_ERROR", err);
        throw (err as AxiosError).response;
    }
}

export async function loadLotteriesStatusesReq() {
    try {
        const { data } = await http().get<ILotteriesStatusesList>("/api/lotteries/statuses");
        return data;
    } catch (err: unknown) {
        log.error("LOAD_LOTTERY_STATUSES_ERROR", err);
        throw (err as AxiosError).response;
    }
}

export async function getLotteryByIDReq(id: number) {
    try {
        const { data } = await http().get<ILotteriesItem>(`/api/lotteries/${ id }`);
        return data;
    } catch (err: unknown) {
        log.error("LOAD_LOTTERY_BY_SLUG_ERROR", err);
        throw (err as AxiosError).response;
    }
}

export async function getLotteryStatusByIDReq(id: number) {
    try {
        const { data } = await http().get<ILotteriesStatusesItem>(`/api/lotteries/${ id }/status`);
        return data;
    } catch (err: unknown) {
        log.error("SET_LOTTERY_STATUS_BY_ID_ERROR", err);
        throw (err as AxiosError).response;
    }
}
