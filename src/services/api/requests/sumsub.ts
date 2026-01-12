import { log } from "../../../controllers/Logger";
import { http } from "../http";

export async function getSumsubTokenReq(levelName?: string) {
    try {
        const params = levelName ? { levelName } : {};
        const { data } = await http().get<{ access_token: string }>("/api/sumsub/access_token", { params });
        return data;
    } catch (err) {
        log.error("GET_SUMSUB_TOKEN_REQ_ERROR", err);
    }
}
