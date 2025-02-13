import { log } from "../../../controllers/Logger";
import { http } from "../http";

export async function loadManagePagesConfigReq(): Promise<Record<string, boolean> | undefined> {
    try {
        const { data } = await http().get<Record<string, boolean>>("/api/fe/config/manage-promotion-pages");
        return data;
    } catch (err) {
        log.error("LOAD_MANAGE_PAGES_CONFIG_ERROR", err);
    }
}
