import log from "../../../controllers/Logger";
import { IWinnerResponse } from "../../../models/winners";
import { http } from "../http";

export async function loadWinnersReq() {
    try {
        const { data } = await http().get<IWinnerResponse[]>("/api/stats/winners/latest");
        return data;
    } catch (err) {
        log.error("LOAD_WINNERS_ERROR", err);
    }
}
