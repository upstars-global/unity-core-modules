import { log } from "../../../controllers/Logger";
import { IStatuses } from "../DTO/statuses";
import { http } from "../http";

export async function loadAllStatuses() {
    try {
        const { data } = await http().get<IStatuses[]>("/api/info/statuses");

        return data;
    } catch (err) {
        log.error("LOAD_LEVELS_DATA_ERROR", err);
    }
}
