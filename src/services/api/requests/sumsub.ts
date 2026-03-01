import { log } from "../../../controllers/Logger";
import type { SumsubVerificationStatus } from "../../../store/user/userVerificationSumsub";
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

export async function getSumsubAccessTokenDirectReq(userId: string | number, levelName?: string) {
    try {
        const { data } = await http().post<{ access_token: string; userId: string }>(
            "/api-fe/sumsub/access-token",
            { userId: String(userId), levelName },
        );
        return data;
    } catch (err) {
        log.error("GET_SUMSUB_ACCESS_TOKEN_DIRECT_ERROR", err);
    }
}

export async function getSumsubVerificationStatusReq(userId: string | number) {
    try {
        const { data } = await http().get<SumsubVerificationStatus>(
            `/api-fe/sumsub/verification-status?userId=${encodeURIComponent(String(userId))}`,
        );
        return data;
    } catch (err) {
        log.error("GET_SUMSUB_VERIFICATION_STATUS_ERROR", err);
    }
}
