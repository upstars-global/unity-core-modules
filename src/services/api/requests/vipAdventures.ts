import { FE_API_PREFIX } from "../../../consts/apiConfig";
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
            `${ FE_API_PREFIX }/jam/vip_status_progress`,
            {
                // @ts-expect-error -- TS2353: Object literal may only specify known properties, and 'withCredentials' does not exist in type 'Omit<RequestConfig, "method" | "url">'.
                withCredentials: true,
            },
        );
        // @ts-expect-error -- TS2322: Type 'unknown' is not assignable to type 'IVipProgress'.
        return data;
    } catch (err) {
        log.error("LOAD_VIP_STATUS_PROGRESS", err);
        throw err;
    }
}
