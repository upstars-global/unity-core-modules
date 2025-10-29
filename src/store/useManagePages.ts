import { defineStore, Pinia, storeToRefs } from "pinia";
import { ref } from "vue";

import { isExistData } from "../helpers/isExistData";
import { loadManagePagesConfigReq } from "../services/api/requests/managePages";
import { useUserStatuses } from "./user/userStatuses";

export const useManagePages = defineStore("managePages", () => {
    const { isUserTester } = storeToRefs(useUserStatuses());
    const pageConfiguration = ref<Record<string, boolean>>();


    async function loadPagesConfig() {
        if (isExistData(pageConfiguration.value)) {
            return;
        }
        pageConfiguration.value = await loadManagePagesConfigReq();
    }

    function isEnablePageBySlug(slug: string) {
        if (isUserTester.value) {
            return isUserTester.value;
        }

        return (pageConfiguration.value && pageConfiguration.value[slug]) || false;
    }

    return {
        pageConfiguration,
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
