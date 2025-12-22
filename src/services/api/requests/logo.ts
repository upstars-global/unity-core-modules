import { FE_API_PREFIX } from "../../../consts/apiConfig";
import { log } from "../../../controllers/Logger";
import { ILogoConfig } from "../DTO/logo";
import { http } from "../http";

export async function loadLogoConfigReq(): Promise<ILogoConfig | undefined> {
    try {
        const { data } = await http().get<ILogoConfig>(`${ FE_API_PREFIX }/config/logo-config`);
        return data;
    } catch (err) {
        log.error("LOAD_LOGO_CONFIG_ERROR", err);
    }
}
