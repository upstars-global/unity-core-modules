import { log } from "../../../controllers/Logger";
import { IStatus } from "../../../models/levels";
import { http } from "../http";

export async function loadAllStatuses() {
    try {
        const { data } = await http().get<IStatus[]>("/api/info/statuses");

        return data;
    } catch (err) {
        log.error("LOAD_LEVELS_DATA_ERROR", err);
        throw err;
    }
}
