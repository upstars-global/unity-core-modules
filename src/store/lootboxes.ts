import { filterIssuedLootBoxes } from "@helpers/lootBoxes";
import { defineStore, Pinia, storeToRefs } from "pinia";
import { computed, ref } from "vue";

import { type ILootbox, sectionsWheelConfigs, sectionsWheelSegmentConfigs } from "../models/lootboxes";
import type { IPageItemCMS } from "../services/api/DTO/CMS";
import type { ILootboxesFileConfig, ILootboxItemConfig } from "../services/api/DTO/lootboxes";
import { useCMS } from "./CMS";
import { useUserStatuses } from "./user/userStatuses";

export const useLootboxesStore = defineStore("lootboxes", () => {
    const lootboxesList = ref<ILootbox[]>([]);
    const fakeIdPrizeWin = ref<number>();
    const mockSectionsWheelConfigs = ref<ILootboxesFileConfig>(sectionsWheelConfigs);
    const mockSectionsWheelSegmentConfigs = ref<Record<string, ILootboxesFileConfig>>(sectionsWheelSegmentConfigs);
    const redeemableSpinInfo = ref<Record<string, unknown>>();
    const { getUserGroups } = storeToRefs(useUserStatuses());

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

    function setMockSectionsWheelConfigs(configs: ILootboxesFileConfig) {
        mockSectionsWheelConfigs.value = configs;
    }

    function setMockSectionsWheelSegmentConfigs(configs: Record<string, ILootboxesFileConfig>) {
        mockSectionsWheelSegmentConfigs.value = configs;
    }

    function setPageContentByGroup(content: IPageItemCMS) {
        pageContentByGroup.value = content;
    }

    function setRedeemableSpinInfo(info: Record<string, unknown>) {
        redeemableSpinInfo.value = info;
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

        updateLootboxList,
        clearLootboxesUserData,

        setMockSectionsWheelConfigs,
        setMockSectionsWheelSegmentConfigs,
        setPageContentByGroup,
        setRedeemableSpinInfo,
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

