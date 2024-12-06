import log from "../../../controllers/Logger";
import type { IActiveCouponResp } from "../DTO/couponePromoCodes";
import { http } from "../http";

export async function activeCouponReq(code: string): Promise<IActiveCouponResp> {
    try {
        const { data } = await http().post<IActiveCouponResp>("/api/v2/bonuses/promo-code", { code });
        return data;
    } catch (err) {
        log.error("ACTIVE_COUPON_ERROR", err);
        throw err;
    }
}
