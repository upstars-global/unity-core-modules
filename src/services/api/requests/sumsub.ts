import { log } from "../../../controllers/Logger";
import { http } from "../http";

export async function getSumsubTokenReq() {
    try {
        const { data } = await http().get<{ access_token: string }>("/api/sumsub/access_token");
        return data;
    } catch (err) {
        log.error("GET_SUMSUB_TOKEN_REQ_ERROR", err);
    }
}
