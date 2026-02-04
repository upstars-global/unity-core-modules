import { defineStore, Pinia, storeToRefs } from "pinia";
import { ref } from "vue";

import { useUserStatuses } from "./user/userStatuses";

export const useManagePages = defineStore("managePages", () => {
    const { isUserTester } = storeToRefs(useUserStatuses());
    const pageConfiguration = ref<Record<string, boolean>>();

    function isEnablePageBySlug(slug: string) {
        if (isUserTester.value) {
            return isUserTester.value;
        }

        return (pageConfiguration.value && pageConfiguration.value[slug]) || false;
    }

    function setPageConfiguration(config: Record<string, boolean>) {
        pageConfiguration.value = config;
    }

    return {
        pageConfiguration,
        isEnablePageBySlug,
        setPageConfiguration,
    };
});
