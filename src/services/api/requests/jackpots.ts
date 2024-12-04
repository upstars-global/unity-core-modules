import {IJackpotItem} from "../DTO/jackpot";
import { http } from "../http";

export async function loadJackpotsList(): Promise<IJackpotItem[]> {
    const { data } = await http().get<IJackpotItem[]>("/api/jackpots");
    return data;
}
