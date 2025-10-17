import { useLevelsStore } from "../store/levels/levelsStore";
import { loadAllStatuses } from "./api/requests/statuses";

export async function loadLevelsData() {
    const { setLevelsData } = useLevelsStore();
    const statuses = await loadAllStatuses();

    if (!statuses) {
        return;
    }

    setLevelsData(statuses);
}
