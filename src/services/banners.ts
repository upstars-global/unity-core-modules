import { storeToRefs } from "pinia";

import { isExistData } from "../helpers/isExistData";
import { useBannerStore } from "../store/banners";
import { useMultilangStore } from "../store/multilang";
import { loadBannersConfigReq } from "./api/requests/banners";

export async function loadBanners() {
    const bannersStore = useBannerStore();
    const { getUserLocale } = storeToRefs(useMultilangStore());

    if (isExistData(bannersStore.banners.value)) {
        return;
    }

    const config = await loadBannersConfigReq(getUserLocale.value);

    if (config) {
        bannersStore.setBanners(config.banners);
    }
}
