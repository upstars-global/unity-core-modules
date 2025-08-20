import { filterIssuedLootBoxes } from "@helpers/lootBoxes";
import { defineStore, Pinia, storeToRefs } from "pinia";
import { computed, ref } from "vue";

import { log } from "../controllers/Logger";
import { CompPointRatesTypes } from "../models/enums/compPoints";
import { type ILootbox, sectionsWheelConfigs, sectionsWheelSegmentConfigs } from "../models/lootboxes";
import type { IPageItemCMS } from "../services/api/DTO/CMS";
import type { ILootboxesFileConfig, ILootboxItemConfig } from "../services/api/DTO/lootboxes";
import { http } from "../services/api/http";
import { loadCompPointRateBySlug } from "../services/api/requests/compPoints";
import {
    loadMockLootboxWheelConfigs,
    loadMockLootboxWheelSegmentsConfigs,
    loadPageContentFromWheelCmsReq,
} from "../services/api/requests/lootbox";
import { useCMS } from "./CMS";
import { useUserInfo } from "./user/userInfo";
import { useUserStatuses } from "./user/userStatuses";

export const useLootboxesStore = defineStore("lootboxes", () => {
    const lootboxesList = ref<ILootbox[]>([]);
    const fakeIdPrizeWin = ref<number>();
    const mockSectionsWheelConfigs = ref<ILootboxesFileConfig>(sectionsWheelConfigs);
    const mockSectionsWheelSegmentConfigs = ref<Record<string, ILootboxesFileConfig>>(sectionsWheelSegmentConfigs);
    const redeemableSpinInfo = ref<Record<string, unknown>>();
    const { getUserGroups } = storeToRefs(useUserStatuses());
    const { getIsLogged } = storeToRefs(useUserInfo());
    const { currentStaticPage } = storeToRefs(useCMS());

    const pageContentByGroup = ref<IPageItemCMS>();

    const lootboxListIssued = computed<ILootbox[]>(() => {
        return filterIssuedLootBoxes(lootboxesList.value);
    });
    const countActiveLootbox = computed(() => lootboxListIssued.value.length);

    const userGroupForWheel = computed(() => {
        return Object.keys(mockSectionsWheelSegmentConfigs.value).find((key) => getUserGroups.value.includes(Number(key)));
    });
    const getMockSegmentWheelUser = computed<ILootboxItemConfig[]>(() => {
        return mockSectionsWheelSegmentConfigs.value[userGroupForWheel.value] || [];
    });
    const getRedeemableSpinInfo = computed(() => {
        return redeemableSpinInfo.value || currentStaticPage.value?.meta?.json.rateInfo;
    });

    function updateLootboxList({ data: newData }: { data: ILootbox }): void {
        const indexNewData = lootboxesList.value.findIndex((item) => item.id === newData.id);

        if (indexNewData === -1) {
            lootboxesList.value = [ newData, ...lootboxesList.value ];
        } else {
            lootboxesList.value = lootboxesList.value.map((item, index) =>
                (index === indexNewData ? newData : item),
            );
        }
    }

    async function loadMockWheel() {
        const fileMockSectionsWheel = await loadMockLootboxWheelConfigs();
        if (fileMockSectionsWheel) {
            mockSectionsWheelConfigs.value = fileMockSectionsWheel as ILootboxesFileConfig;
        }
    }
    async function loadMockSegmentsWheel() {
        const fileMockSectionsWheel = await loadMockLootboxWheelSegmentsConfigs();
        if (fileMockSectionsWheel) {
            mockSectionsWheelSegmentConfigs.value = fileMockSectionsWheel as Record<string, ILootboxesFileConfig>;
        }
    }

    async function loadPageContentFormCMS() {
        const pageContent = await loadPageContentFromWheelCmsReq(userGroupForWheel.value || "");
        if (pageContent) {
            pageContentByGroup.value = pageContent;
        }
    }

    async function loadPageContentFormCMSBySlug(slug: string) {
        const pageContent = await loadPageContentFromWheelCmsReq(slug);
        if (pageContent) {
            pageContentByGroup.value = pageContent;
        }
    }

    async function loadRedeemableSpinInto() {
        if (getIsLogged.value) {
            const rates = await loadCompPointRateBySlug(CompPointRatesTypes.LOOTBOXES);
            redeemableSpinInfo.value = rates?.find((item) => item.bonus_title?.includes("manual_wheel"));
        }
        return redeemableSpinInfo.value;
    }

    function clearLootboxesUserData(): void {
        lootboxesList.value = [];
    }

    return {
        lootboxesList,
        fakeIdPrizeWin,

        lootboxListIssued,
        countActiveLootbox,
        redeemableSpinInfo,

        userGroupForWheel,
        getMockSegmentWheelUser,
        mockSectionsWheelConfigs,
        mockSectionsWheelSegmentConfigs,
        pageContentByGroup,
        getRedeemableSpinInfo,

        loadMockWheel,
        loadMockSegmentsWheel,
        loadRedeemableSpinInto,

        updateLootboxList,
        clearLootboxesUserData,
        loadPageContentFormCMS,
        loadPageContentFormCMSBySlug,
    };
});


export function useLootboxesStoreFetchService(pinia?: Pinia) {
    const {
        loadMockWheel,
        loadMockSegmentsWheel,
    } = useLootboxesStore(pinia);

    return {
        loadMockWheel,
        loadMockSegmentsWheel,
    };
}

