import type { ILogoConfig } from "@api/DTO/logo";
import { loadLogoConfigReq } from "@api/requests/logo";
import { useRootStore } from "@store/root";
import { useUserInfo } from "@store/user/userInfo";
import logoMob from "@theme/images/BrandImages/logo-mob.svg";
import logo from "@theme/images/BrandImages/logo.svg";
import { defineStore, storeToRefs } from "pinia";
import type { Pinia } from "pinia";
import { computed, ref } from "vue";

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
    const getLogoSrc = computed( () => {

        return getIsLogged.value && isMobile.value ? getMobileLogoSrc.value : getFullLogoSrc.value;
    });
    async function loadLogoConfig() {
        if (logoConfig.value) {
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
        loadLogoConfig
    };
}
