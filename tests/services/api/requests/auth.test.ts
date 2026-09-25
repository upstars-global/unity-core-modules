import { afterEach, describe, expect, it, vi } from "vitest";

const setupAuthRequestsModule = async () => {
    vi.resetModules();

    const postMock = vi.fn();
    const deleteMock = vi.fn();
    const logError = vi.fn();

    vi.doMock("../../../../src/controllers/Logger", () => ({
        log: {
            error: logError,
        },
    }));
    vi.doMock("../../../../src/services/api/http", () => ({
        http: vi.fn(() => ({
            delete: deleteMock,
            post: postMock,
        })),
    }));

    const authRequestsModule = await import("../../../../src/services/api/requests/auth");

    return {
        ...authRequestsModule,
        logError,
        deleteMock,
        postMock,
    };
};

afterEach(() => {
    vi.restoreAllMocks();
});

describe("auth requests", () => {
    it("forwards challenge context in signIn request config", async () => {
        const { postMock, signIn } = await setupAuthRequestsModule();
        const response = {
            data: {
                id: 42,
            },
        };

        postMock.mockResolvedValue(response);

        await expect(signIn({
            email: "qa@example.com",
            password: "password",
        }, {
            challengeContext: {
                reason: "registration",
                returnTo: "/registration?utm_source=qa",
            },
        })).resolves.toEqual(response.data);

        expect(postMock).toHaveBeenCalledWith("/api/users/sign_in", {
            user: {
                email: "qa@example.com",
                password: "password",
            },
        }, {
            challengeContext: {
                reason: "registration",
                returnTo: "/registration?utm_source=qa",
            },
        });
    });

    it("propagates login and registration errors without raw request logs", async () => {
        const { logError, postMock, registerUser, signIn } = await setupAuthRequestsModule();
        const error = new Error("private auth response");
        postMock.mockRejectedValue(error);

        await expect(signIn({ email: "private@example.com", password: "private" })).rejects.toBe(error);
        await expect(registerUser({ user: { email: "private@example.com" } })).rejects.toBe(error);

        expect(logError).not.toHaveBeenCalled();
    });

    it("covers checkEmail success and error behavior", async () => {
        const { checkEmail, logError, postMock } = await setupAuthRequestsModule();
        const data = { email: "qa@example.com", exists: true };
        postMock.mockResolvedValueOnce({ data });

        await expect(checkEmail("qa@example.com")).resolves.toEqual(data);
        expect(postMock).toHaveBeenCalledWith("/api-fe/check-email", { email: "qa@example.com" });

        const error = new Error("check email failed");
        postMock.mockRejectedValueOnce(error);
        await expect(checkEmail("qa@example.com")).rejects.toBe(error);
        expect(logError).toHaveBeenCalledWith("CHECK_EMAIL_VERIFY_ERROR", error);
    });

    it("covers signOut success and error behavior", async () => {
        const { deleteMock, logError, signOut } = await setupAuthRequestsModule();
        deleteMock.mockResolvedValueOnce(undefined);

        await expect(signOut()).resolves.toBeUndefined();
        expect(deleteMock).toHaveBeenCalledWith("/api/users/sign_out");

        const error = new Error("sign out failed");
        deleteMock.mockRejectedValueOnce(error);
        await expect(signOut()).rejects.toBe(error);
        expect(logError).toHaveBeenCalledWith("LOGOUT_REQUEST_ERROR", error);
    });

    it("covers userAccessCheckReq success and error behavior", async () => {
        const { logError, postMock, userAccessCheckReq } = await setupAuthRequestsModule();
        const response = { data: { allowed: true } };
        const user = { email: "qa@example.com" };
        postMock.mockResolvedValueOnce(response);

        await expect(userAccessCheckReq(user)).resolves.toBe(response);
        expect(postMock).toHaveBeenCalledWith("/api-fe/users/access_check", { user });

        const error = new Error("access check failed");
        postMock.mockRejectedValueOnce(error);
        await expect(userAccessCheckReq(user)).rejects.toBe(error);
        expect(logError).toHaveBeenCalledWith("COVERY_VERIFY_ERROR", error);
    });
});
