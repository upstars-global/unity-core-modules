import { storeToRefs } from "pinia";

import { isExistData } from "../helpers/isExistData";
import { CompPointRatesTypes } from "../models/enums/compPoints";
import { useLootboxesStore } from "../store/lootboxes";
import { useUserInfo } from "../store/user/userInfo";
import { loadPageContentFromCmsReq } from "./api/requests/CMS";
import { loadCompPointRateBySlug } from "./api/requests/compPoints";
import {
    activateLootboxReq,
    getLootboxesReq,
    loadMockLootboxWheelConfigs,
    loadMockLootboxWheelSegmentsConfigs,
} from "./api/requests/lootbox";

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

export async function loadMockWheel() {
    const lootboxesStore = useLootboxesStore();
    if (lootboxesStore.mockSectionsWheelConfigs.value) {
        return;
    }
    const fileMockSectionsWheel = await loadMockLootboxWheelConfigs();

    if (fileMockSectionsWheel) {
        lootboxesStore.setMockSectionsWheelConfigs(fileMockSectionsWheel);
    }
}

export async function loadMockSegmentsWheel() {
    const lootboxesStore = useLootboxesStore();
    if (isExistData(lootboxesStore.mockSectionsWheelSegmentConfigs.value)) {
        return;
    }

    const fileMockSectionsWheel = await loadMockLootboxWheelSegmentsConfigs();

    if (fileMockSectionsWheel) {
        lootboxesStore.setMockSectionsWheelSegmentConfigs(fileMockSectionsWheel);
    }
}

export async function loadPageContentFormCMS() {
    const lootboxesStore = useLootboxesStore();
    const { userGroupForWheel } = storeToRefs(lootboxesStore);
    const pageContent = await loadPageContentFromCmsReq(userGroupForWheel.value || "");

    if (pageContent) {
        lootboxesStore.setPageContentByGroup(pageContent);
    }
}

export async function loadPageContentFormCMSBySlug(slug: string) {
    const lootboxesStore = useLootboxesStore();
    const pageContent = await loadPageContentFromCmsReq(slug);

    if (pageContent) {
        lootboxesStore.setPageContentByGroup(pageContent);
    }
}

export async function loadRedeemableSpinInfo() {
    const { getIsLogged } = storeToRefs(useUserInfo());
    const lootboxesStore = useLootboxesStore();

    if (getIsLogged.value) {
        const rates = await loadCompPointRateBySlug(CompPointRatesTypes.LOOTBOXES);

        lootboxesStore.setRedeemableSpinInfo(rates?.find((item) => item.bonus_title?.includes("manual_wheel")));
    }
}
