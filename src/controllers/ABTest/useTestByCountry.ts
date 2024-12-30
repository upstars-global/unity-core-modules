import { COUNTRIES } from "@theme/configs/constsLocales";
import { storeToRefs } from "pinia";
import { computed } from "vue";

import { useUserInfo } from "../../store/user/userInfo";
import { ABTestController } from "./ABTestController";

const testEnableByCountry: Record<string, boolean> = {
    [COUNTRIES.CANADA]: false,
};

export const useTestByCountry = () => {
    const { getUserInfo } = storeToRefs(useUserInfo());

    const isEnableTestByCountry = computed<boolean | undefined>(() => {
        // @ts-expect-error Type 'null' cannot be used as an index type
        return testEnableByCountry[getUserInfo.value.country];
    });

    const isCountryVariantB = computed<boolean>(() => {
        return isEnableTestByCountry.value ? ABTestController.isVariantB : true;
    });

    return {
        isCountryVariantB,
    };
};
