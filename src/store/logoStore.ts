import {defineStore, storeToRefs} from "pinia";
import { useRootStore } from "../store/root"; // TODO: replace import after move root store to core
import { useUserInfo } from "@store/user/userInfo"; // TODO: replace import after move userInfo store to core
import type { Pinia } from "pinia";
import { computed, ref } from "vue";
import {ILogoConfig} from "../services/api/DTO/logo";
import {loadLogoConfigReq} from "../services/api/requests/logo";

export interface ILogoStoreConfig {
    logo: string,
    logoMob: string,
}
export function createLogoStore(config: ILogoStoreConfig) {
    return defineStore("logoStore", () => {
        const logoConfig = ref<ILogoConfig>();
        const { getIsLogged } = storeToRefs(useUserInfo());
        const { isMobile } = storeToRefs(useRootStore());

        const getMobileLogoSrc = computed(() => {
            return logoConfig.value?.logoUrl.mobile || config.logoMob;
        });
        const getFullLogoSrc = computed(() => {
            return logoConfig.value?.logoUrl.full || config.logo;
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
}

export function useLogoStoreFetchService(config: ILogoStoreConfig, pinia?: Pinia) {
    const logoStore = createLogoStore(config);
    const {
        loadLogoConfig,
    } = logoStore(pinia);

    return {
        loadLogoConfig
    };
}
