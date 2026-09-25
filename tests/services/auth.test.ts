import { beforeEach, describe, expect, it, vi } from "vitest";

const clearFreshChatUserMock = vi.fn();
const loadAuthDataMock = vi.fn();
const signInMock = vi.fn();
const registerUserMock = vi.fn();
const toggleUserIsLoggedMock = vi.fn();
const reportAuthTechnicalErrorMock = vi.fn();
const logErrorMock = vi.fn();

vi.mock("../../src/controllers/CoveryController", () => ({
    default: {
        deviceFingerprint: vi.fn(() => "fingerprint"),
    },
}));

vi.mock("../../src/controllers/Logger", () => ({
    log: {
        error: logErrorMock,
    },
}));

vi.mock("../../src/services/api/requests/auth", () => ({
    checkEmail: vi.fn(),
    registerUser: registerUserMock,
    signIn: signInMock,
    signOut: vi.fn(),
}));

vi.mock("../../src/helpers/authTelemetry", () => ({
    reportAuthTechnicalError: reportAuthTechnicalErrorMock,
}));

vi.mock("../../src/store/user/userInfo", () => ({
    useUserInfo: vi.fn(() => ({
        toggleUserIsLogged: toggleUserIsLoggedMock,
    })),
}));

vi.mock("../../src/services/user", () => ({
    changeUserToGroup: vi.fn(),
}));

describe("auth services", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
        clearFreshChatUserMock.mockResolvedValue(undefined);
        loadAuthDataMock.mockResolvedValue(undefined);
        signInMock.mockResolvedValue({ id: 1 });
        registerUserMock.mockResolvedValue({ id: 1 });
        reportAuthTechnicalErrorMock.mockReset();
        toggleUserIsLoggedMock.mockReset();
    });

    it("forwards explicit challenge context from registration auto-login", async () => {
        const { createLogin } = await import("../../src/services/auth");
        const login = createLogin({
            clearFreshChatUser: clearFreshChatUserMock,
            loadAuthData: loadAuthDataMock,
        });

        await login({
            captcha: "captcha-token",
            challengeReason: "registration",
            challengeReturnTo: "/registration?cfChallenge=registration",
            custom_login_reg: "yes",
            email: "qa@example.com",
            password: "password",
            route: "/registration",
        });

        expect(signInMock).toHaveBeenCalledWith({
            captcha: "captcha-token",
            custom_login_reg: "yes",
            dfpc: "fingerprint",
            email: "qa@example.com",
            password: "password",
        }, {
            challengeContext: {
                reason: "registration",
                returnTo: "/registration?cfChallenge=registration",
            },
        });
    });

    it("keeps regular login challenges marked as login", async () => {
        const { createLogin } = await import("../../src/services/auth");
        const login = createLogin({
            clearFreshChatUser: clearFreshChatUserMock,
            loadAuthData: loadAuthDataMock,
        });

        await login({
            captcha: "captcha-token",
            email: "qa@example.com",
            password: "password",
            route: "/login",
        });

        expect(signInMock).toHaveBeenCalledWith({
            captcha: "captcha-token",
            custom_login_reg: undefined,
            dfpc: "fingerprint",
            email: "qa@example.com",
            password: "password",
        }, {
            challengeContext: {
                reason: "login",
            },
        });
    });

    it("preserves HTTP response errors from login without duplicate telemetry", async () => {
        const { createLogin } = await import("../../src/services/auth");
        const response = { status: 422, data: { error: "invalid credentials" } };
        signInMock.mockRejectedValueOnce({ message: "HTTP 422", response });
        const login = createLogin({
            clearFreshChatUser: clearFreshChatUserMock,
            loadAuthData: loadAuthDataMock,
        });

        await expect(login({ email: "private@example.com", password: "private" })).rejects.toEqual(response);

        expect(reportAuthTechnicalErrorMock).not.toHaveBeenCalled();
    });

    it("rethrows unexpected login failures and emits only fixed context", async () => {
        const { createLogin } = await import("../../src/services/auth");
        const error = new Error("private login details");
        signInMock.mockRejectedValueOnce(error);
        const login = createLogin({
            clearFreshChatUser: clearFreshChatUserMock,
            loadAuthData: loadAuthDataMock,
        });

        await expect(login({ email: "private@example.com", password: "private" })).rejects.toBe(error);

        expect(reportAuthTechnicalErrorMock).toHaveBeenCalledWith({
            flow: "login",
            step: "client",
            reason: "unexpected",
        });
    });

    it("keeps registration-specific client failures out of the request context", async () => {
        const { createRegistration } = await import("../../src/services/auth");
        const error = new Error("private registration details");
        registerUserMock.mockRejectedValueOnce(error);
        const registration = createRegistration({ loadAuthData: loadAuthDataMock, enableABReg: false });

        await expect(registration({ user: { email: "private@example.com" } })).rejects.toBe(error);

        expect(reportAuthTechnicalErrorMock).toHaveBeenCalledWith({
            flow: "registration",
            step: "client",
            reason: "unexpected",
        });
    });

    it("preserves the two-factor response data and logs only a fixed message", async () => {
        const { createLoginTwoFactor } = await import("../../src/services/auth");
        const response = { status: 422, data: { errors: { otp_attempt: ["invalid"] } } };
        signInMock.mockRejectedValueOnce({ message: "HTTP 422", response });
        const loginTwoFactor = createLoginTwoFactor({ loadAuthData: loadAuthDataMock });

        await expect(loginTwoFactor("private-code")).rejects.toEqual(response.data);

        expect(logErrorMock).toHaveBeenCalledWith("LOGIN_TWO_FACTORS_ERROR", { message: "login:client" });
        expect(logErrorMock.mock.calls.flat().join(" ")).not.toContain("private-code");
        expect(reportAuthTechnicalErrorMock).not.toHaveBeenCalled();
    });
});
