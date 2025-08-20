import { storeToRefs } from "pinia";

import { useLootboxesStore } from "../store/lootboxes";
import { activateLootboxReq, getLootboxesReq } from "./api/requests/lootbox";

export async function loadLootboxesList({ reload }: { reload?: boolean } = {}) {
    const { lootboxesList } = storeToRefs(useLootboxesStore());

    if (!reload && lootboxesList.value.length) {
        return;
    }

    const data = await getLootboxesReq();

    if (data) {
        lootboxesList.value = data;
    }
}

export function loadPrizeOfLootbox(id: number) {
    return activateLootboxReq(id);
}
