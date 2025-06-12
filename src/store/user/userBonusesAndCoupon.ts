import { defineStore } from "pinia";

import { log } from "../../controllers/Logger";
import { http } from "../../services/api/http";
import { activeCouponReq } from "../../services/api/requests/couponePromoCodes";
import { loadDepositGiftsData } from "../../services/gifts";
import { useGiftsStore } from "../gifts";
import { useUserInfo } from "./userInfo";

export const useUserBonusesAndCoupon = defineStore("userBonusesAndCoupon", () => {
    const userStore = useUserInfo();
    const giftsStore = useGiftsStore();

    async function setDepositBonusCode(code: string) {
        try {
            await http().patch("/api/player/set_bonus_code", {
                deposit_bonus_code: code,
            });
            userStore.loadUserProfile({ reload: true });

            await loadDepositGiftsData();

            return { promoIsValid: Boolean(giftsStore.depositGiftsAll.length) };
        } catch (err) {
            log.error("setDepositBonusCode", err);
        }
    }

    async function deleteDepositBonusCode() {
        try {
            await http().delete("/api/player/clear_bonus_code");
            userStore.loadUserProfile({ reload: true });
            loadDepositGiftsData();
        } catch (err) {
            log.error("deleteDepositBonusCode", err);
        }
    }

    async function useBonuses(data: { can_issue: boolean }) {
        try {
            await http().patch("/api/player/update_bonus_settings", data);
            userStore.loadUserProfile({ reload: true });
            return await loadDepositGiftsData();
        } catch (err) {
            log.error("useBonuses", err);
        }
    }

    async function activateUserCoupon(code: string) {
        try {
            const { data } = await http().post("/api/bonuses/coupon", {

                coupon_code: code,
            });
            return data.status;
        } catch (err) {
            log.error("activateUserCoupon", err);
        }
    }

    async function activateBettingCoupon(code: string) {
        return await activeCouponReq(code);
    }

    return {
        setDepositBonusCode,
        deleteDepositBonusCode,
        useBonuses,
        activateUserCoupon,
        activateBettingCoupon,
    };
});
