import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import type{ Pinia } from "pinia";
import { defineStore, storeToRefs } from "pinia";
import { computed, ref } from "vue";

import { useWelcomePack } from "../controllers/useWelcomePack";
import { prepareJackpotsBanners } from "../helpers/jackpotsHelpers";
import type { IBannerConfig, IViewedGTMBanners } from "../models/banners";
import type { IFileCMS } from "../services/api/DTO/CMS";
import { loadAllFilesFromCMSReq } from "../services/api/requests/CMS";
import { useConfigStore } from "./configStore";
import { useMultilangStore } from "./multilang";
import { useSettings } from "./settings";
import { useUserInfo } from "./user/userInfo";
import { useUserStatuses } from "./user/userStatuses";

export const useBannerStore = defineStore("bannerStore", () => {
    const { $defaultProjectConfig } = useConfigStore();
    const {
        BANNER_CATEGORY_131811__HIDE,
        BANNER_CATEGORY_131811_SHOW,
        BANNER_CATEGORY_JACKPOTS,
        BANNER_CATEGORY_TERMS_CONDITIONS,
        shouldDisplayRegistrationBanner,
    } = $defaultProjectConfig;
    const { getIsLogged, isCryptoUserCurrency } = storeToRefs(useUserInfo());
    const { getUserGroups } = storeToRefs(useUserStatuses());
    const { getUserLocale } = storeToRefs(useMultilangStore());

    const banners = ref<IBannerConfig[]>([]);
    const termsFiles = ref<IFileCMS[]>([]);
    const viewedGTMBanners = ref<IViewedGTMBanners[]>([]);

    const getBannersData = computed(() => {
        dayjs.extend(customParseFormat);

        let bannersFilteredByConfigsFile = welcomePackBannersFilter(banners.value).filter(({ groups, liveTime }) => {
            if (liveTime) {
                const format = "DD/MM/YYYY HH:mm";
                const now = dayjs.utc();
                const start = liveTime.start && dayjs(liveTime.start, format).utc();
                if (!now.isAfter(start)) {
                    return false;
                }
                const end = liveTime.end && dayjs(liveTime.end, format).utc();

                if (now.isAfter(end)) {
                    return false;
                }
            }

            if (groups?.length) {
                return groups.some((groupId) => {
                    return getUserGroups.value?.includes(groupId);
                });
            }
            return true;
        });

        const { isCryptoDomain } = storeToRefs(useSettings());

        bannersFilteredByConfigsFile = bannersFilteredByConfigsFile
            .filter(shouldDisplayRegistrationBanner({
                userIsLogged: getIsLogged.value,
                isCryptoDomain: isCryptoDomain.value,
                isCryptoUserCurrency: isCryptoUserCurrency.value,
            }));

        return bannersFilteredByConfigsFile.map((banner) => {
            if (banner.categories.includes(BANNER_CATEGORY_JACKPOTS)) {
                return prepareJackpotsBanners(banner);
            }
            return banner;
        });
    });

    async function loadCMSPages(): Promise<IFileCMS[] | undefined> {
        if (
            termsFiles.value.length
        ) {
            return;
        }

        const filesCMS: IFileCMS[] = await loadAllFilesFromCMSReq(getUserLocale.value);

        filesCMS.forEach((file) => {
            if (file.categories.includes(BANNER_CATEGORY_TERMS_CONDITIONS)) {
                termsFiles.value = [ ...termsFiles.value, file ];
            }
        });

        return filesCMS;
    }

    function welcomePackBannersFilter(bannersList: IBannerConfig[] = []): IBannerConfig[] {
        const { showWelcomePack } = useWelcomePack();

        return bannersList.filter((bannerData) => {
            if (showWelcomePack.value) {
                return bannerData.categories.includes(BANNER_CATEGORY_131811_SHOW) ||
                    !bannerData.categories.includes(BANNER_CATEGORY_131811__HIDE);
            }

            return !bannerData.categories.includes(BANNER_CATEGORY_131811_SHOW);
        });
    }

    function setBanners(list: IBannerConfig[]) {
        banners.value = list;
    }
    function setViewedGTMBanners(items: IViewedGTMBanners) {
        viewedGTMBanners.value.push(items);
    }
    function clearViewedGTMBanners() {
        viewedGTMBanners.value = [];
    }

    return {
        loadCMSPages,
        setBanners,
        banners,
        termsFiles,
        getBannersData,

        viewedGTMBanners,
        setViewedGTMBanners,
        clearViewedGTMBanners,
    };
});

export function useBannersFetchService(pinia?: Pinia) {
    const {
        loadCMSPages,
    } = useBannerStore(pinia);

    return {
        loadCMSPages,
    };
}
