import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";

import { type ITwoFactorAuthData, type IUserSession } from "../../src/models/user";
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
});
