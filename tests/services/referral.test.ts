import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    ClaimReferralCodeError,
    CreateReferralCodeError,
    LoadReferralCodesError,
} from "../../src/services/api/requests/referral";
import {
    claimReferralCodeReq,
    createReferralCodeReq,
    loadReferralCodesReq,
} from "../../src/services/api/requests/referral";
import {
    claimReferralCode,
    createReferralCode,
    loadReferralCodes,
} from "../../src/services/referral";
import { useReferral } from "../../src/store/referral";

vi.mock("../../src/store/referral", () => ({
    useReferral: vi.fn(),
}));

vi.mock("../../src/services/api/requests/referral", async () => {
    const actual = await vi.importActual("../../src/services/api/requests/referral");

    return {
        ...actual,
        claimReferralCodeReq: vi.fn(),
        createReferralCodeReq: vi.fn(),
        loadReferralCodesReq: vi.fn(),
    };
});

describe("referral service", () => {
    const storeMock = {
        addReferralCode: vi.fn(),
        setReferralCodes: vi.fn(),
        setStatistics: vi.fn(),
    };

    const referralCodesResponse = {
        referral_codes: [
            {
                refcode: "abc",
                claimed_amount: 10,
                completed_users_count: 2,
                to_claim_amount: 5,
            },
        ],
        aggregated_data: {
            total_invited: 7,
            total_claimed: 3,
        },
        currency: "USD",
    };

    beforeEach(() => {
        vi.mocked(useReferral).mockReturnValue(storeMock as ReturnType<typeof useReferral>);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("loads referral codes into store on success", async () => {
        vi.mocked(loadReferralCodesReq).mockResolvedValue(referralCodesResponse);

        const result = await loadReferralCodes();

        expect(result).toEqual({ ok: true });
        expect(storeMock.setReferralCodes).toHaveBeenCalledWith(referralCodesResponse.referral_codes);
        expect(storeMock.setStatistics).toHaveBeenCalledWith(referralCodesResponse.aggregated_data);
    });

    it("returns mapped load error code", async () => {
        vi.mocked(loadReferralCodesReq).mockRejectedValue(new LoadReferralCodesError("user_duplicate"));

        const result = await loadReferralCodes();

        expect(result).toEqual({ ok: false, code: "user_duplicate" });
        expect(storeMock.setReferralCodes).not.toHaveBeenCalled();
        expect(storeMock.setStatistics).not.toHaveBeenCalled();
    });

    it("returns unknown load error code for unexpected failures", async () => {
        vi.mocked(loadReferralCodesReq).mockRejectedValue(new Error("boom"));

        const result = await loadReferralCodes();

        expect(result).toEqual({ ok: false, code: "unknown_error" });
    });

    it("adds created referral code to store on success", async () => {
        const newCode = {
            refcode: "new",
            claimed_amount: 0,
            completed_users_count: 0,
            to_claim_amount: 15,
        };
        vi.mocked(createReferralCodeReq).mockResolvedValue(newCode);

        const result = await createReferralCode("new");

        expect(result).toEqual({ ok: true });
        expect(createReferralCodeReq).toHaveBeenCalledWith("new");
        expect(storeMock.addReferralCode).toHaveBeenCalledWith(newCode);
    });

    it("returns mapped create error code", async () => {
        vi.mocked(createReferralCodeReq).mockRejectedValue(new CreateReferralCodeError("already_exists"));

        const result = await createReferralCode("duplicate");

        expect(result).toEqual({ ok: false, code: "already_exists" });
        expect(storeMock.addReferralCode).not.toHaveBeenCalled();
    });

    it("returns unknown create error code for unexpected failures", async () => {
        vi.mocked(createReferralCodeReq).mockRejectedValue(new Error("boom"));

        const result = await createReferralCode("broken");

        expect(result).toEqual({ ok: false, code: "unknown_error" });
    });

    it("claims referral code and refreshes list on success", async () => {
        vi.mocked(claimReferralCodeReq).mockResolvedValue(undefined);
        vi.mocked(loadReferralCodesReq).mockResolvedValue(referralCodesResponse);

        const result = await claimReferralCode("abc");

        expect(result).toEqual({ ok: true });
        expect(claimReferralCodeReq).toHaveBeenCalledWith("abc");
        expect(loadReferralCodesReq).toHaveBeenCalledTimes(1);
        expect(storeMock.setReferralCodes).toHaveBeenCalledWith(referralCodesResponse.referral_codes);
        expect(storeMock.setStatistics).toHaveBeenCalledWith(referralCodesResponse.aggregated_data);
    });

    it("returns mapped claim error code", async () => {
        vi.mocked(claimReferralCodeReq).mockRejectedValue(new ClaimReferralCodeError("already_claimed"));

        const result = await claimReferralCode("abc");

        expect(result).toEqual({ ok: false, code: "already_claimed" });
        expect(loadReferralCodesReq).not.toHaveBeenCalled();
    });

    it("returns unknown claim error code for unexpected failures", async () => {
        vi.mocked(claimReferralCodeReq).mockRejectedValue(new Error("boom"));

        const result = await claimReferralCode("abc");

        expect(result).toEqual({ ok: false, code: "unknown_error" });
        expect(loadReferralCodesReq).not.toHaveBeenCalled();
    });
});
