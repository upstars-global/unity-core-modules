import { log } from "../../../controllers/Logger";
import type {
    IReferralCodeDTO,
    IReferralCodeErrorDTO,
    IReferralCodesResponseDTO,
    ReferralCodeClaimErrorCode,
    ReferralCodeCreateErrorCode,
    ReferralCodesLoadErrorCode,
} from "../DTO/referralDTO";
import { http, isHttpError } from "../http";

export class CreateReferralCodeError extends Error {
    constructor(public readonly code: ReferralCodeCreateErrorCode) {
        super(code);
        this.name = "CreateReferralCodeError";
    }
}

export class LoadReferralCodesError extends Error {
    constructor(public readonly code: ReferralCodesLoadErrorCode) {
        super(code);
        this.name = "LoadReferralCodesError";
    }
}

export class ClaimReferralCodeError extends Error {
    constructor(public readonly code: ReferralCodeClaimErrorCode) {
        super(code);
        this.name = "ClaimReferralCodeError";
    }
}

export async function loadReferralCodesReq(currency?: string): Promise<IReferralCodesResponseDTO> {
    try {
        const { data } = await http().get<IReferralCodesResponseDTO>("/api/player/referral_system/list", {
            params: { currency },
        });
        return data;
    } catch (error) {
        if (isHttpError(error) && error.response?.status === 422) {
            const errorData = error.response.data as IReferralCodeErrorDTO<ReferralCodesLoadErrorCode>;
            const errorCode = errorData?.errors?.ref_code;

            if (errorCode) {
                throw new LoadReferralCodesError(errorCode);
            }
        }

        log.error("LOAD_REFERRAL_CODES_ERROR", error);
        throw error;
    }
}

export async function createReferralCodeReq(code: string): Promise<IReferralCodeDTO> {
    try {
        const { data } = await http().post<IReferralCodeDTO>("/api/player/referral_system", { ref_code: code });
        return data;
    } catch (error) {
        if (isHttpError(error) && error.response?.status === 422) {
            const errorData = error.response.data as IReferralCodeErrorDTO<ReferralCodeCreateErrorCode>;
            const errorCode = errorData?.errors?.ref_code;

            if (errorCode) {
                throw new CreateReferralCodeError(errorCode);
            }
        }

        log.error("CREATE_REFERRAL_CODE_ERROR", error);
        throw error;
    }
}

export async function claimReferralCodeReq(code: string) {
    try {
        await http().post("/api/player/referral_system/claim", { ref_code: code });
    } catch (error) {
        if (isHttpError(error) && error.response?.status === 422) {
            const errorData = error.response.data as IReferralCodeErrorDTO<ReferralCodeClaimErrorCode>;
            const errorCode = errorData?.errors?.ref_code;

            if (errorCode) {
                throw new ClaimReferralCodeError(errorCode);
            }
        }

        log.error("CLAIM_REFERRAL_CODE_ERROR", error);
        throw error;
    }
}
