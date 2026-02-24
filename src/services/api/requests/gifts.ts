import { log } from "../../../controllers/Logger";
import { ICancelInfoGifts } from "../DTO/gifts";
import { http } from "../http";

export async function getPlayerBonusesReq() {
    try {
        const { data } = await http().get("/api/player/bonuses");
        return data;
    } catch (err) {
        log.error("GET_PLAYER_BONUSES_REQUEST_ERROR", err);
        throw err;
    }
}

export async function getPlayerFreespinsReq() {
    try {
        const { data } = await http().get("/api/player/freespins");

        return data;
    } catch (err) {
        log.error("GET_PLAYER_FREESPINS_REQUEST_ERROR", err);
        throw err;
    }
}

export async function getDepositBonusesReq() {
    try {
        const { data } = await http().get("/api/bonuses/deposit");
        return data;
    } catch (err) {
        log.error("GET_DEPOSIT_BONUSES_REQUEST_ERROR", err);
        throw err;
    }
}

export async function getRegistrationBonusesReq() {
    try {
        const { data } = await http().get("/api/bonuses/registration");
        return data;
    } catch (err) {
        log.error("GET_REGISTRATION_BONUSES_REQUEST_ERROR", err);
        throw err;
    }
}

export function cancelFreespinsReq(id: number) {
    return http().delete(`/api/player/freespins/${ id }`);
}

export function cancelBonusesReq(id: number) {
    return http().delete(`/api/player/bonuses/${ id }`);
}

export function activateFreespinsReq(id: number) {
    return http().post(`/api/player/freespins/${ id }/activation`);
}

export function activateBonusesReq(id: number) {
    return http().post(`/api/player/bonuses/${ id }/activation`);
}

export function cancelDepositBonusesReq(id: number) {
    return http().delete(`/api/bonuses/deposit/${ id }`);
}

export function cancelRegistrationBonusesReq(id: number) {
    return http().delete(`/api/bonuses/registration/${ id }`);
}

export function cancelInfoBonusesReq(id: number) {
    return http().get<ICancelInfoGifts>(`/api/player/bonuses/${id}/cancel_info`);
}
