import { afterEach, describe, expect, it, vi } from "vitest";

const loadCaptchaHelper = async (settingsRef: { value: { recaptcha?: string } | undefined }) => {
    vi.resetModules();

    const execute = vi.fn();
    const load = vi.fn(async () => ({ execute }));
    const logError = vi.fn();
    const eventEmit = vi.fn();
    vi.doMock("pinia", async (importOriginal) => ({
        ...await importOriginal<typeof import("pinia")>(),
        storeToRefs: () => ({ getSettings: settingsRef }),
    }));
    vi.doMock("recaptcha-v3", () => ({ load }));
    vi.doMock("../../src/store/user/userInfo", () => ({ useUserInfo: vi.fn() }));
    vi.doMock("../../src/controllers/Logger", () => ({ log: { error: logError } }));
    vi.doMock("../../src/helpers/ssrHelpers", () => ({ isServer: false }));
    vi.doMock("../../src/plugins/EventBus", () => ({
        BUS_EVENTS: { AUTH_TECHNICAL_ERROR: "auth-technical-error" },
        EventBus: { $emit: eventEmit },
    }));

    const { generateCaptcha } = await import("../../src/helpers/recaptchaHelper");
    return { eventEmit, execute, generateCaptcha, load, logError };
};

afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
});

describe("generateCaptcha", () => {
    it("preserves the SDK action and resolves with its token", async () => {
        const settingsRef = { value: { recaptcha: "site-key" } };
        const { execute, generateCaptcha, load } = await loadCaptchaHelper(settingsRef);
        execute.mockResolvedValue("captcha-token");

        await expect(generateCaptcha("LOGIN")).resolves.toBe("captcha-token");

        expect(load).toHaveBeenCalledWith("site-key", { autoHideBadge: true });
        expect(execute).toHaveBeenCalledWith("LOGIN");
    });

    it("keeps repeated successful calls independent", async () => {
        const settingsRef = { value: { recaptcha: "site-key" } };
        const { execute, generateCaptcha, load } = await loadCaptchaHelper(settingsRef);
        execute.mockResolvedValue("captcha-token");

        for (let attempt = 0; attempt < 6; attempt++) {
            await expect(generateCaptcha("login")).resolves.toBe("captcha-token");
        }

        expect(load).toHaveBeenCalledTimes(6);
        expect(execute).toHaveBeenCalledTimes(6);
    });

    it("reports a settings timeout after five checks and four waits", async () => {
        vi.useFakeTimers();
        let settingsChecks = 0;
        const settingsRef = {
            get value() {
                settingsChecks++;
                return undefined;
            },
        };
        const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");
        const { eventEmit, generateCaptcha, logError } = await loadCaptchaHelper(settingsRef);
        const captchaPromise = generateCaptcha("REGISTRATION");
        await vi.runAllTimersAsync();

        await expect(captchaPromise).resolves.toBeUndefined();
        expect(settingsChecks).toBe(5);
        expect(setTimeoutSpy).toHaveBeenCalledTimes(4);
        expect(logError).toHaveBeenCalledWith("AUTH_CAPTCHA_GENERATION_FAILURE", {
            message: "registration:settings_timeout",
        });
        expect(eventEmit).toHaveBeenCalledWith("auth-technical-error", {
            flow: "registration",
            step: "captcha",
            reason: "settings_timeout",
        });
    });

    it("allows a new call to succeed after a settings timeout", async () => {
        vi.useFakeTimers();
        const settingsRef: { value: { recaptcha?: string } | undefined } = { value: undefined };
        const { execute, generateCaptcha, load } = await loadCaptchaHelper(settingsRef);
        execute.mockResolvedValue("captcha-token");
        const firstCaptcha = generateCaptcha("login");
        await vi.runAllTimersAsync();
        await expect(firstCaptcha).resolves.toBeUndefined();

        settingsRef.value = { recaptcha: "site-key" };
        await expect(generateCaptcha("login")).resolves.toBe("captcha-token");

        expect(load).toHaveBeenCalledTimes(1);
        expect(execute).toHaveBeenCalledTimes(1);
    });

    it("reports SDK failures without exposing the exception", async () => {
        const settingsRef = { value: { recaptcha: "site-key" } };
        const { eventEmit, generateCaptcha, load, logError } = await loadCaptchaHelper(settingsRef);
        load.mockRejectedValue(new Error("private sdk details"));

        await expect(generateCaptcha("login")).resolves.toBeUndefined();

        expect(logError).toHaveBeenCalledWith("AUTH_CAPTCHA_GENERATION_FAILURE", {
            message: "login:sdk_error",
        });
        expect(eventEmit).toHaveBeenCalledWith("auth-technical-error", {
            flow: "login",
            step: "captcha",
            reason: "sdk_error",
        });
        expect(logError.mock.calls.flat().join(" ")).not.toContain("private sdk details");
    });

    it("returns undefined when execute and telemetry both fail", async () => {
        const settingsRef = { value: { recaptcha: "site-key" } };
        const { eventEmit, execute, generateCaptcha, logError } = await loadCaptchaHelper(settingsRef);
        execute.mockRejectedValue(new Error("private sdk details"));
        logError.mockImplementation(() => {
            throw new Error("logger unavailable");
        });
        eventEmit.mockImplementation(() => {
            throw new Error("event bus unavailable");
        });

        await expect(generateCaptcha("registration")).resolves.toBeUndefined();
    });
});
