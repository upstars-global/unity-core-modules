import { storeToRefs } from "pinia";

import { useBannerStore } from "../store/banners";
import { useMultilangStore } from "../store/multilang";
import { loadBannersConfigReq } from "./api/requests/banners";

export async function loadBanners() {
    const bannersStore = useBannerStore();
    const { getUserLocale } = storeToRefs(useMultilangStore());

    const config = await loadBannersConfigReq(getUserLocale.value);

    if (config) {
        bannersStore.setBanners(config.banners);
    }
}
