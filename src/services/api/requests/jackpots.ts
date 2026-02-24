import { log } from "../../../controllers/Logger";
import { IJackpotWinner } from "../../../models/winner";
import { IJackpotItem } from "../DTO/jackpot";
import { http } from "../http";

export async function loadJackpotsList(): Promise<IJackpotItem[] | void> {
    try {
        const { data } = await http().get<IJackpotItem[]>("/api/jackpots");

        return data;
    } catch (error) {
        log.error("LOAD_JACKPOTS_LIST_ERROR", error);
    }
}

export async function getJackpotWinnersReq() {
    try {
        const { data } = await http().get<IJackpotWinner[]>("/api/jackpot_wins");

        return data;
    } catch (err) {
        log.error("GET_JACKPOT_WINNERS_ERROR", err);
    }
}
