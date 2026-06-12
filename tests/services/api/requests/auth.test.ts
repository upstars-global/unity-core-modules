import { afterEach, describe, expect, it, vi } from "vitest";

const setupAuthRequestsModule = async () => {
    vi.resetModules();

    const postMock = vi.fn();
    const logError = vi.fn();

    vi.doMock("../../../../src/controllers/Logger", () => ({
        log: {
            error: logError,
        },
    }));
    vi.doMock("../../../../src/services/api/http", () => ({
        http: vi.fn(() => ({
            post: postMock,
        })),
    }));

    const authRequestsModule = await import("../../../../src/services/api/requests/auth");

    return {
        ...authRequestsModule,
        logError,
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
});
