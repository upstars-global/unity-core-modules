import { storeToRefs } from "pinia";

import { useReferral } from "../store/referral";
import { useUserInfo } from "../store/user/userInfo";
import type {
    ReferralCodeClaimErrorCode,
    ReferralCodeCreateErrorCode,
    ReferralCodesLoadErrorCode,
} from "./api/DTO/referralDTO";
import {
    ClaimReferralCodeError,
    claimReferralCodeReq,
    CreateReferralCodeError,
    createReferralCodeReq,
    LoadReferralCodesError,
    loadReferralCodesReq,
} from "./api/requests/referral";

type ReferralServiceResult<TCode extends string = never> =
    | { ok: true }
    | { ok: false; code: TCode | "unknown_error" };

type LoadReferralCodesResult = ReferralServiceResult<ReferralCodesLoadErrorCode>;
type CreateReferralCodeResult = ReferralServiceResult<ReferralCodeCreateErrorCode>;
type ClaimReferralCodeResult = ReferralServiceResult<ReferralCodeClaimErrorCode>;

export async function loadReferralCodes(): Promise<LoadReferralCodesResult> {
    const referralStore = useReferral();
    const { getUserCurrency } = storeToRefs(useUserInfo());

    try {
        const referralCodesResponse = await loadReferralCodesReq(getUserCurrency.value);

        referralStore.setReferralCodes(referralCodesResponse.referral_codes);
        referralStore.setStatistics(referralCodesResponse.aggregated_data);

        return { ok: true };
    } catch (error) {
        if (error instanceof LoadReferralCodesError) {
            return { ok: false, code: error.code };
        }

        return { ok: false, code: "unknown_error" };
    }
}

export async function createReferralCode(code: string): Promise<CreateReferralCodeResult> {
    const referralStore = useReferral();

    try {
        const newCode = await createReferralCodeReq(code);

        referralStore.addReferralCode(newCode);

        return { ok: true };
    } catch (error) {
        if (error instanceof CreateReferralCodeError) {
            return { ok: false, code: error.code };
        }

        return { ok: false, code: "unknown_error" };
    }
}

export async function claimReferralCode(code: string): Promise<ClaimReferralCodeResult> {
    try {
        await claimReferralCodeReq(code);
        await loadReferralCodes();

        return { ok: true };
    } catch (error) {
        if (error instanceof ClaimReferralCodeError) {
            return { ok: false, code: error.code };
        }

        return { ok: false, code: "unknown_error" };
    }
}
