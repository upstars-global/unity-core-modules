import { storeToRefs } from "pinia";

import { ensureStoreData } from "../helpers/ensureStoreData";
import { useBannerStore } from "../store/banners";
import { useMultilangStore } from "../store/multilang";
import { loadBannersConfigReq } from "./api/requests/banners";

export async function loadBanners() {
    const bannersStore = useBannerStore();
    const { getUserLocale } = storeToRefs(useMultilangStore());

    const banners = await ensureStoreData(
        bannersStore.banners.value,
        async () => {
            const data = await loadBannersConfigReq(getUserLocale.value);
            return data?.banners;
        });

    if (banners) {
        bannersStore.setBanners(banners);
    }
}
