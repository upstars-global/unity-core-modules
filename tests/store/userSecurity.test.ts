import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";

import { type ITwoFactorAuthData, type IUserSession } from "../../src/models/user";
import { useCommon } from "../../src/store/common";
import { useUserInfo } from "../../src/store/user/userInfo";
import { useUserSecurity } from "../../src/store/user/userSecurity";

const createSession = (overrides: Partial<IUserSession> = {}): IUserSession => ({
    id: 1,
    ip: "127.0.0.1",
    country: "US",
    user_agent: "Mozilla/5.0",
    created_at: "2024-01-01T00:00:00.000Z",
    current: false,
    ...overrides,
});

describe("useUserSecurity store", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it("initializes with empty sessions and two-factor data", () => {
        const store = useUserSecurity();

        expect(store.userActiveSessions).toEqual([]);
        expect(store.twoFactorData).toEqual({});
    });

    it("setUserActiveSessions updates sessions list", () => {
        const store = useUserSecurity();
        const sessions = [
            createSession(),
            createSession({ id: 2, current: true }),
        ];

        store.setUserActiveSessions(sessions);

        expect(store.userActiveSessions).toEqual(sessions);
    });

    it("setTwoFactorData updates two-factor data", () => {
        const store = useUserSecurity();
        const twoFactorData: ITwoFactorAuthData = {
            otp_secret: "otp-secret",
            data: "qr-code",
        };

        store.setTwoFactorData(twoFactorData);

        expect(store.twoFactorData).toEqual(twoFactorData);
    });

    it.each([
        [ "idle", false, false, false ],
        [ "loading", true, false, false ],
        [ "created", false, true, false ],
        [ "already_requested", false, true, true ],
        [ "error", false, false, false ],
    ] as const)("derives GDPR properties from %s", (status, loading, requested, alreadyRequested) => {
        const store = useUserSecurity();
        store.$patch({ gdprReport: { status } });

        expect(store.isGdprReportLoading).toBe(loading);
        expect(store.isGdprReportRequested).toBe(requested);
        expect(store.isGdprReportAlreadyRequested).toBe(alreadyRequested);
    });

    it("resets GDPR state synchronously on account changes and logout", () => {
        useCommon().$patch({ infoProject: { gdpr_report_enabled: true } });
        const user = useUserInfo();
        user.setUserData({ id: 42 });
        const store = useUserSecurity();
        const request = store.startGdprReportRequest();
        store.completeGdprReportRequest(request!, "created");

        user.setUserData({ id: 43 });
        expect(store.gdprReport.status).toBe("idle");
        store.startGdprReportRequest();
        user.clearUserData();
        expect(store.gdprReport.status).toBe("idle");
    });

    it("starts one GDPR request and ignores its result after an account reset", () => {
        useCommon().$patch({ infoProject: { gdpr_report_enabled: true } });
        useUserInfo().setUserData({ id: 42 });
        const store = useUserSecurity();
        const request = store.startGdprReportRequest();

        expect(request).toBeDefined();
        expect(store.isGdprReportLoading).toBe(true);
        expect(store.startGdprReportRequest()).toBeUndefined();

        useUserInfo().setUserData({ id: 43 });
        store.completeGdprReportRequest(request!, "created");

        expect(store.gdprReport.status).toBe("idle");
        expect(store.isGdprReportRequested).toBe(false);
    });
});
