import log from "../../../controllers/Logger";
import { ILogoConfig } from "../DTO/logo";
import { http } from "../http";

export async function loadLogoConfigReq(): Promise<ILogoConfig | undefined> {
    try {
        const { data } = await http().get<ILogoConfig>("/api/fe/config/logo-config");
        return data;
    } catch (err) {
        log.error("LOAD_LOGO_CONFIG_ERROR", err);
    }
}
