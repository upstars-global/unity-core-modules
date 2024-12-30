import { log } from "../../../controllers/Logger";
import { IVipProgress } from "../DTO/vipAdventuresDTO";
import { http } from "../http";
import { loadVipAdventuresConfigReq } from "./configs";

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
            "/jam/vip_status_progress",
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
