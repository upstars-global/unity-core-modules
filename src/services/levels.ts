import { isExistData } from "../helpers/isExistData";
import { useLevelsStore } from "../store/levels/levelsStore";
import { loadAllStatuses } from "./api/requests/statuses";

export async function loadLevelsData() {
    const levelsStore = useLevelsStore();

    if (isExistData(levelsStore.levels) && isExistData(levelsStore.groups)) {
        return;
    }
    const statuses = await loadAllStatuses();

    if (!statuses) {
        return;
    }

    levelsStore.setLevelsData(statuses);
}
