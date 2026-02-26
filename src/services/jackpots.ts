import { storeToRefs } from "pinia";

import { log } from "../controllers/Logger";
import { isExistData } from "../helpers/isExistData";
import { useJackpots } from "../store/jackpots";
import { useJackpotWinners } from "../store/winnersJackpot";
import { IJackpotItem } from "./api/DTO/jackpot";
import { getJackpotWinnersReq, loadJackpotsList } from "./api/requests/jackpots";

export async function loadJackpots(): Promise<IJackpotItem[] | void> {
    const jackpotsStore = useJackpots();
    const { jackpotsList } = storeToRefs(jackpotsStore);

    if (isExistData(jackpotsList.value)) {
        return jackpotsList.value;
    }

    const data = await loadJackpotsList();

    if (data) {
        jackpotsStore.setJackpotsList(data);
    }

    return data;
}

export async function getJackpotWinners() {
    try {
        const winnersStore = useJackpotWinners();
        const data = await getJackpotWinnersReq();

        if (!data) {
            return;
        }

        winnersStore.setWinnersData(data);
    } catch (err) {
        log.error("GET_JACKPOT_WINNERS_ERROR", err);
    }
}
