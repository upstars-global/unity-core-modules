import { IBannerCMSConfig } from "../../../models/banners";
import { http } from "../http";

export async function loadBannersConfigReq(): Promise<IBannerCMSConfig | undefined> {
    try {
        const { data } = await http().get<IBannerCMSConfig>("/api/fe/config/banners-config");
        return data;
    } catch (err) {
        log.error("LOAD_BANNER_CONFIG_ERROR", err);
    }
}
