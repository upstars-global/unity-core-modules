import { afterEach, describe, expect, it, vi } from "vitest";

const createValidationError = (code: string) => ({
    response: {
        status: 422,
        data: {
            errors: {
                ref_code: code,
            },
        },
    },
});

const setupReferralRequestsModule = async () => {
    vi.resetModules();

    const getMock = vi.fn();
    const postMock = vi.fn();
    const logError = vi.fn();
    const isHttpError = vi.fn();

    vi.doMock("../../../../src/controllers/Logger", () => ({
        log: {
            error: logError,
        },
    }));
    vi.doMock("../../../../src/services/api/http", () => ({
        http: vi.fn(() => ({
            get: getMock,
            post: postMock,
        })),
        isHttpError,
    }));

    const referralRequestsModule = await import("../../../../src/services/api/requests/referral");

    return {
        ...referralRequestsModule,
        getMock,
        isHttpError,
        logError,
        postMock,
    };
};

afterEach(() => {
    vi.restoreAllMocks();
});

describe("referral requests", () => {
    it("loads referral codes response", async () => {
        const { getMock, loadReferralCodesReq } = await setupReferralRequestsModule();
        const response = {
            data: {
                referral_codes: [],
                aggregated_data: {
                    total_invited: 0,
                    total_claimed: 0,
                },
                currency: "USD",
            },
        };
        getMock.mockResolvedValue(response);

        await expect(loadReferralCodesReq()).resolves.toEqual(response.data);
        expect(getMock).toHaveBeenCalledWith("/api/player/referral_system/list");
    });

    it("maps 422 load error to LoadReferralCodesError", async () => {
        const {
            LoadReferralCodesError,
            getMock,
            isHttpError,
            loadReferralCodesReq,
            logError,
        } = await setupReferralRequestsModule();
        const error = createValidationError("user_duplicate");
        getMock.mockRejectedValue(error);
        isHttpError.mockReturnValue(true);

        await expect(loadReferralCodesReq()).rejects.toEqual(new LoadReferralCodesError("user_duplicate"));
        expect(logError).not.toHaveBeenCalled();
    });

    it("returns data from create referral request", async () => {
        const { createReferralCodeReq, postMock } = await setupReferralRequestsModule();
        const response = {
            data: {
                refcode: "abc",
                claimed_amount: 0,
                completed_users_count: 0,
                to_claim_amount: 10,
            },
        };
        postMock.mockResolvedValue(response);

        await expect(createReferralCodeReq("abc")).resolves.toEqual(response.data);
        expect(postMock).toHaveBeenCalledWith("/api/player/referral_system", { ref_code: "abc" });
    });

    it("maps 422 create error to CreateReferralCodeError", async () => {
        const {
            CreateReferralCodeError,
            createReferralCodeReq,
            isHttpError,
            logError,
            postMock,
        } = await setupReferralRequestsModule();
        const error = createValidationError("already_exists");
        postMock.mockRejectedValue(error);
        isHttpError.mockReturnValue(true);

        await expect(createReferralCodeReq("abc")).rejects.toEqual(new CreateReferralCodeError("already_exists"));
        expect(logError).not.toHaveBeenCalled();
    });

    it("sends claim referral request payload", async () => {
        const { claimReferralCodeReq, postMock } = await setupReferralRequestsModule();
        postMock.mockResolvedValue({ data: undefined });

        await expect(claimReferralCodeReq("abc")).resolves.toBeUndefined();
        expect(postMock).toHaveBeenCalledWith("/api/player/referral_system/claim", { ref_code: "abc" });
    });

    it("maps 422 claim error to ClaimReferralCodeError", async () => {
        const {
            ClaimReferralCodeError,
            claimReferralCodeReq,
            isHttpError,
            logError,
            postMock,
        } = await setupReferralRequestsModule();
        const error = createValidationError("already_claimed");
        postMock.mockRejectedValue(error);
        isHttpError.mockReturnValue(true);

        await expect(claimReferralCodeReq("abc")).rejects.toEqual(new ClaimReferralCodeError("already_claimed"));
        expect(logError).not.toHaveBeenCalled();
    });

    it("logs and rethrows unexpected request errors", async () => {
        const { createReferralCodeReq, isHttpError, logError, postMock } = await setupReferralRequestsModule();
        const error = new Error("network");
        postMock.mockRejectedValue(error);
        isHttpError.mockReturnValue(false);

        await expect(createReferralCodeReq("abc")).rejects.toThrow("network");
        expect(logError).toHaveBeenCalledWith("CREATE_REFERRAL_CODE_ERROR", error);
    });
});
