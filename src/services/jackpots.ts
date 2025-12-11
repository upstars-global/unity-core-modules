import { useJackpots } from "../store/jackpots";
import { IJackpotItem } from "./api/DTO/jackpot";
import { loadJackpotsList } from "./api/requests/jackpots";

export async function loadJackpots(): Promise<IJackpotItem[] | void> {
    const jackpotsStore = useJackpots();
    const data = await loadJackpotsList();

    if (data) {
        jackpotsStore.setJackpotsList(data);
    }

    return data;
}
