import { LocaleName, Locales } from "../DTO/multilang";
import { http } from "../http";
import log from "../../../controllers/Logger";

export async function loadLocalesReq(query?: string): Promise<Locales> {
    try {
        const { data } = await http().get<Locales>(`/api/info/locales?${ query }`);
        return data;
    } catch (err) {
        log.error("LOAD_LOCALES_ERR", err);
        throw err;
    }
}

export async function updateLocalesReq({ locale }: { locale: LocaleName }): Promise<void> {
    try {
        return http().patch("/api/player/update_locale", { locale });
    } catch (err) {
        log.error("UPDATE_USER_LOCALE", err);
        throw err;
    }
}
