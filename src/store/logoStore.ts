import logo from "@theme/images/BrandImages/logo.svg";
import logoMob from "@theme/images/BrandImages/logo-mob.svg";
import { defineStore, type Pinia, storeToRefs } from "pinia";
import { computed, ref } from "vue";

import { isExistData } from "../helpers/isExistData";
import { ILogoConfig } from "../services/api/DTO/logo";
import { loadLogoConfigReq } from "../services/api/requests/logo";
import { useRootStore } from "./root";
import { useUserInfo } from "./user/userInfo";

export const useLogoStore = defineStore("logoStore", () => {
    const logoConfig = ref<ILogoConfig>();
    const { getIsLogged } = storeToRefs(useUserInfo());
    const { isMobile } = storeToRefs(useRootStore());

    const getMobileLogoSrc = computed(() => {
        return logoConfig.value?.logoUrl.mobile || logoMob;
    });
    const getFullLogoSrc = computed(() => {
        return logoConfig.value?.logoUrl.full || logo;
    });
    const getLogoSrc = computed(() => {
        return getIsLogged.value && isMobile.value ? getMobileLogoSrc.value : getFullLogoSrc.value;
    });
    async function loadLogoConfig() {
        if (isExistData(logoConfig.value)) {
            return;
        }
        logoConfig.value = await loadLogoConfigReq();
    }

    return {
        getLogoSrc,
        logoConfig,
        getMobileLogoSrc,
        getFullLogoSrc,
        loadLogoConfig,
    };
});

export function useLogoStoreFetchService(pinia?: Pinia) {
    const {
        loadLogoConfig,
    } = useLogoStore(pinia);

    return {
        loadLogoConfig,
    };
}
