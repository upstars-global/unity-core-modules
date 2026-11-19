import { beforeEach, describe, expect, it, vi } from "vitest";

const { post, logError } = vi.hoisted(() => ({ post: vi.fn(), logError: vi.fn() }));

vi.mock("../../../../src/services/api/http", () => ({
    http: () => ({ post }),
}));
vi.mock("../../../../src/controllers/Logger", () => ({
    log: { error: logError },
}));

import { requestGdprReportReq } from "../../../../src/services/api/requests/player";

describe("requestGdprReportReq", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("posts without a payload and succeeds with an empty response", async () => {
        post.mockResolvedValue({ status: 200, data: null });

        await expect(requestGdprReportReq()).resolves.toBeUndefined();
        expect(post).toHaveBeenCalledExactlyOnceWith("/api/gdpr_reports");
        expect(logError).not.toHaveBeenCalled();
    });

    it.each([ "already_exist", "no_permissions" ])("preserves the documented %s error", async (code) => {
        const error = Object.assign(new Error("HTTP 422"), {
            response: { status: 422, data: { errors: { report: [ code ] } } },
        });
        post.mockRejectedValue(error);

        await expect(requestGdprReportReq()).rejects.toBe(error);
        expect(logError).toHaveBeenCalledWith("REQUEST_GDPR_REPORT_ERROR", error);
    });

    it("propagates a network failure without changing it", async () => {
        const error = new Error("Network Error");
        post.mockRejectedValue(error);

        await expect(requestGdprReportReq()).rejects.toBe(error);
    });
});
