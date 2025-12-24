import { FE_API_PREFIX } from "../../../consts/apiConfig";
import { log } from "../../../controllers/Logger";
import type { IBannerCMSConfig } from "../../../models/banners";
import { http } from "../http";

export async function loadBannersConfigReq(locale: string): Promise<IBannerCMSConfig | undefined> {
    try {
        const { data } = await http({ locale }).get<IBannerCMSConfig>(`${ FE_API_PREFIX }/config/banners-config`);
        return data;
    } catch (err) {
        log.error("LOAD_BANNER_CONFIG_ERROR", err);
    }
}
