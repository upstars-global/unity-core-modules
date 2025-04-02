import type { IBannerCMSConfig } from "../../../models/banners";
import { http } from "../http";

export async function loadBannersConfigReq(locale: string): Promise<IBannerCMSConfig | undefined> {
    try {
        const { data } = await http({ locale }).get<IBannerCMSConfig>("/api/fe/config/banners-config");
        return data;
    } catch (err) {
        log.error("LOAD_BANNER_CONFIG_ERROR", err);
    }
}
