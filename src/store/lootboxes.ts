import { filterIssuedLootBoxes } from "@helpers/lootBoxes";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { log } from "../controllers/Logger";
import { type ILootbox } from "../models/lootboxes";
import type { UserGroup } from "../models/user";
import type { IPageItemCMS } from "../services/api/DTO/CMS";
import type { ILootboxesFileConfig } from "../services/api/DTO/lootboxes";
import { http } from "../services/api/http";
import { loadMockLootboxWheelConfigs, loadPageContentFromWheelCmsReq } from "../services/api/requests/lootbox";


export const useLootboxesStore = defineStore("lootboxes", () => {
    const lootboxesList = ref<ILootbox[]>([]);
    const fakeIdPrizeWin = ref<number>();
    const mockSectionsRocketWheelConfig = ref<ILootboxesFileConfig>([]);
    const userGroupForWheel = ref<UserGroup>();
    const pageContentByGroup = ref<IPageItemCMS>();

    const lootboxListIssued = computed<ILootbox[]>(() => {
        return filterIssuedLootBoxes(lootboxesList.value);
    });

    const countActiveLootbox = computed(() => lootboxListIssued.value.length);

    async function loadLootboxesList({ reload }: { reload?: boolean } = {}): Promise<ILootbox[]> {
        if (!reload && lootboxesList.value.length) {
            return lootboxesList.value;
        }
        try {
            const { data } = await http().get("/api/player/lootboxes");
            lootboxesList.value = data;
            return data;
        } catch (err) {
            log.error("LOAD_LOOTBOXES_LIST_ERROR", err);
            throw err;
        }
    }

    async function loadPrizeOfLootbox(lootboxId: string | number) {
        try {
            const { data } = await http().post(`/api/player/lootboxes/${ lootboxId }/activation`);
            return data;
        } catch (err) {
            log.error("LOAD_PRIZE_OF_LOOTBOX_ERROR", err);
        }
    }

    function updateLootboxList({ data: newData }: { data: ILootbox }): void {
        lootboxesList.value = [
            ...lootboxesList.value.filter(({ id }: { id: ILootbox["id"] }) => {
                return newData.id !== id;
            }),
            newData,
        ];
    }

    async function loadMockSectionsRocketWheel() {
        const fileMockSectionsRocketWheel = await loadMockLootboxWheelConfigs();
        if (fileMockSectionsRocketWheel) {
            mockSectionsRocketWheelConfig.value = fileMockSectionsRocketWheel as ILootboxesFileConfig;
        }
    }

    async function loadPageContentFormCMS() {
        const pageContent = await loadPageContentFromWheelCmsReq(userGroupForWheel.value || "");
        if (pageContent) {
            pageContentByGroup.value = pageContent;
        }
    }

    function clearLootboxesUserData(): void {
        lootboxesList.value = [];
    }

    return {
        lootboxesList,
        fakeIdPrizeWin,

        lootboxListIssued,
        countActiveLootbox,

        loadLootboxesList,
        loadPrizeOfLootbox,

        userGroupForWheel,
        mockSectionsRocketWheelConfig,
        pageContentByGroup,
        loadMockSectionsRocketWheel,

        updateLootboxList,
        clearLootboxesUserData,
        loadPageContentFormCMS,
    };
});
