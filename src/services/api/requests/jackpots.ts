import { log } from "../../../controllers/Logger";
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
