import { defineStore, Pinia, storeToRefs } from "pinia";
import { ref } from "vue";

import { loadManagePagesConfigReq } from "../services/api/requests/managePages";
import { useUserStatuses } from "./user/userStatuses";

export const useManagePages = defineStore("managePages", () => {
    const { isUserTester } = storeToRefs(useUserStatuses());
    const pageConfiguration = ref<Record<string, boolean>>();


    async function loadPagesConfig() {
        if (pageConfiguration.value) {
            return;
        }
        pageConfiguration.value = await loadManagePagesConfigReq();
    }

    function isEnablePageBySlug(slug: string) {
        if (isUserTester.value) {
            return isUserTester.value;
        }

        return pageConfiguration.value ? pageConfiguration.value[slug] : false;
    }

    return {
        loadPagesConfig,
        isEnablePageBySlug,
    };
});


export function useManagePagesFetchService(pinia?: Pinia) {
    const {
        loadPagesConfig,
    } = useManagePages(pinia);

    return {
        loadPagesConfig,
    };
}
