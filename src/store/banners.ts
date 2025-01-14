import {
    BANNER_CATEGORY_131811__HIDE,
    BANNER_CATEGORY_131811_SHOW,
    BANNER_CATEGORY_JACKPOTS,
    BANNER_CATEGORY_TERMS_CONDITIONS,
    BANNERS_CATEGORIES_ENABLE,
    shouldDisplayRegistrationBanner,
} from "@config/banners";
import { typePromotionsFiles } from "@config/tournaments";
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
import { useMultilangStore } from "./multilang";
import { useSettings } from "./settings";
import { useUserInfo } from "./user/userInfo";
import { useUserStatuses } from "./user/userStatuses";

export const useBannerStore = defineStore("bannerStore", () => {
    const { getIsLogged, isCryptoUserCurrency } = storeToRefs(useUserInfo());

    const banners = ref<IBannerConfig[]>([]);
    const tournamentsFiles = ref<IFileCMS[]>([]);
    const lotteriesFiles = ref<IFileCMS[]>([]);
    const questFiles = ref<IFileCMS[]>([]);
    const termsFiles = ref<IFileCMS[]>([]);
    const viewedGTMBanners = ref<IViewedGTMBanners[]>([]);

    const getBannersData = computed(() => {
        const userStatuses = useUserStatuses();
        const userGroups = userStatuses.getUserStatuses?.map((group) => {
            return Number(group.id) || group.id;
        });
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
                    return userGroups?.includes(groupId);
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

    function prepareFileBanner(file: IFileCMS): IBannerConfig {
        let config: IBannerConfig = file;
        try {
            config = { ...config, ...JSON.parse(file.description) };
            config.image = file.url;
        } catch (err) {
            config.description = file.description;
        }

        return config as IBannerConfig;
    }
    async function loadCMSPages(): Promise<IFileCMS[] | undefined> {
        if (
            tournamentsFiles.value.length &&
            lotteriesFiles.value.length &&
            questFiles.value.length &&
            banners.value.length &&
            termsFiles.value.length
        ) {
            return;
        }

        tournamentsFiles.value = [];
        lotteriesFiles.value = [];
        questFiles.value = [];
        banners.value = [];
        termsFiles.value = [];

        const { getUserLocale } = storeToRefs(useMultilangStore());
        const filesCMS: IFileCMS[] = await loadAllFilesFromCMSReq(getUserLocale.value);

        filesCMS.forEach((file) => {
            if (file.categories.includes(typePromotionsFiles.tournaments)) {
                tournamentsFiles.value = [ ...tournamentsFiles.value, file ];
            }
            if (file.categories.includes(typePromotionsFiles.lottery)) {
                lotteriesFiles.value = [ ...lotteriesFiles.value, file ];
            }
            if (file.categories.includes(typePromotionsFiles.quest)) {
                questFiles.value = [ ...questFiles.value, file ];
            }

            if (file.categories.some((fileCategory) => BANNERS_CATEGORIES_ENABLE[fileCategory])) {
                banners.value = [ ...banners.value, prepareFileBanner(file) ];
            }

            if (file.categories.includes(BANNER_CATEGORY_TERMS_CONDITIONS)) {
                termsFiles.value = [ ...termsFiles.value, file ];
            }
        });

        return filesCMS;
    }

    function welcomePackBannersFilter(bannesList: IBannerConfig[] = []): IBannerConfig[] {
        const { showWelcomePack } = useWelcomePack();

        return bannesList.filter((banerData) => {
            if (showWelcomePack.value) {
                return banerData.categories.includes(BANNER_CATEGORY_131811_SHOW) ||
                    !banerData.categories.includes(BANNER_CATEGORY_131811__HIDE);
            }

            return !banerData.categories.includes(BANNER_CATEGORY_131811_SHOW);
        });
    }

    function setViewedGTMBanners(items: IViewedGTMBanners) {
        viewedGTMBanners.value.push(items);
    }
    function clearViewedGTMBanners() {
        viewedGTMBanners.value = [];
    }

    return {
        loadCMSPages,
        banners,
        tournamentsFiles,
        lotteriesFiles,
        questFiles,
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
