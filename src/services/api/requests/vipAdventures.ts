import {IVipProgress} from "../DTO/vipAdventuresDTO";
import { loadVipAdventuresConfigReq } from "./configs";
import log from "../../../controllers/Logger";
import { http } from "../http";

export async function loadVipAdventuresConfigFile() {
    try {
        return await loadVipAdventuresConfigReq();
    } catch (err) {
        log.error("LOAD_VIP_ADVENTURES_CONFIG_FILE", err);
        throw err;
    }
}

export async function loadVipStatusProgress(): Promise<IVipProgress> {
    try {
        const { data } = await http().get(
            `/jam/vip_status_progress`,
            {
                withCredentials: true,
            },
        );
        return data;
    } catch (err) {
        log.error("LOAD_VIP_STATUS_PROGRESS", err);
        throw err;
    }
}
