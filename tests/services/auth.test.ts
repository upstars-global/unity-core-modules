import { beforeEach, describe, expect, it, vi } from "vitest";

const clearFreshChatUserMock = vi.fn();
const loadAuthDataMock = vi.fn();
const signInMock = vi.fn();
const toggleUserIsLoggedMock = vi.fn();

vi.mock("../../src/controllers/CoveryController", () => ({
    default: {
        deviceFingerprint: vi.fn(() => "fingerprint"),
    },
}));

vi.mock("../../src/controllers/Logger", () => ({
    log: {
        error: vi.fn(),
    },
}));

vi.mock("../../src/services/api/requests/auth", () => ({
    checkEmail: vi.fn(),
    registerUser: vi.fn(),
    signIn: signInMock,
    signOut: vi.fn(),
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
});
