import { afterEach, describe, expect, it, vi } from "vitest";

const loadTelemetry = async (isServer: boolean) => {
    vi.resetModules();

    const eventEmit = vi.fn();
    const logError = vi.fn();
    vi.doMock("../../src/helpers/ssrHelpers", () => ({ isServer }));
    vi.doMock("../../src/plugins/EventBus", () => ({
        BUS_EVENTS: { AUTH_TECHNICAL_ERROR: "auth-technical-error" },
        EventBus: { $emit: eventEmit },
    }));
    vi.doMock("../../src/controllers/Logger", () => ({ log: { error: logError } }));

    const { reportAuthTechnicalError } = await import("../../src/helpers/authTelemetry");
    return { eventEmit, logError, reportAuthTechnicalError };
};

afterEach(() => {
    vi.restoreAllMocks();
});

describe("auth telemetry", () => {
    it("logs a fixed message and emits safe client context", async () => {
        const { eventEmit, logError, reportAuthTechnicalError } = await loadTelemetry(false);
        const payload = { flow: "login", step: "password", reason: "network" } as const;

        reportAuthTechnicalError(payload);

        expect(logError).toHaveBeenCalledWith("AUTH_CLIENT_REQUEST_FAILURE", {
            message: "login:password:network",
        });
        expect(eventEmit).toHaveBeenCalledWith("auth-technical-error", payload);
    });

    it.each([
        { reason: "server", status: 500 },
        { reason: "unexpected", status: 200 },
    ] as const)("emits response errors without adding a client Loki log: %s", async ({ reason, status }) => {
        const { eventEmit, logError, reportAuthTechnicalError } = await loadTelemetry(false);
        const payload = { flow: "registration", step: "account_creation", reason, status } as const;

        reportAuthTechnicalError(payload);

        expect(logError).not.toHaveBeenCalled();
        expect(eventEmit).toHaveBeenCalledWith("auth-technical-error", payload);
    });

    it("keeps server logging while suppressing browser event emission", async () => {
        const { eventEmit, logError, reportAuthTechnicalError } = await loadTelemetry(true);
        const payload = { flow: "login", step: "captcha", reason: "settings_timeout" } as const;

        reportAuthTechnicalError(payload);

        expect(logError).toHaveBeenCalledWith("AUTH_CAPTCHA_GENERATION_FAILURE", {
            message: "login:settings_timeout",
        });
        expect(eventEmit).not.toHaveBeenCalled();
    });

    it("continues emitting when the logger fails", async () => {
        const { eventEmit, logError, reportAuthTechnicalError } = await loadTelemetry(false);
        logError.mockImplementation(() => {
            throw new Error("logger unavailable");
        });

        const payload = { flow: "login", step: "client", reason: "unexpected" } as const;
        reportAuthTechnicalError(payload);

        expect(eventEmit).toHaveBeenCalledWith("auth-technical-error", payload);
    });
});
