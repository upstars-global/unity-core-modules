export interface IReferralCodeDTO {
    refcode: string;
    claimed_amount: number;
    users_count: number;
    completed_users_count: number;
    to_claim_amount: number;
}

export type ReferralCodeCreateErrorCode =
    | "invalid_refcode"
    | "user_duplicate"
    | "limit_exceeded"
    | "already_exists";

export type ReferralCodesLoadErrorCode = "user_duplicate";

export type ReferralCodeClaimErrorCode =
    | "already_claimed"
    | "user_duplicate"
    | "invalid";

export interface IReferralCodeErrorDTO<TErrorCode extends string> {
    errors: {
        ref_code: TErrorCode;
    };
}

export interface IReferralCodesResponseDTO {
    referral_codes: IReferralCodeDTO[];
    aggregated_data: {
        total_invited: number;
        total_claimed: number;
    };
    currency: string;
}
