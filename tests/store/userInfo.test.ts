import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";

import { Currencies } from "../../src/models/enums/currencies";
import type { IUserData, IUserStatus } from "../../src/models/user";
import type { IPlayerStats, ISubscriptions, IUserSettings } from "../../src/services/api/DTO/playerDTO";
import { useCommon } from "../../src/store/common";
import { useUserInfo } from "../../src/store/user/userInfo";

describe("useUserInfo store", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it("initializes with default values and currency fallback", () => {
        const store = useUserInfo();
        const common = useCommon();

        expect(store.getUserInfo.user_id).toBe("");
        expect(store.getDataIsLoaded).toBe(false);
        expect(store.getUserCurrency).toBe(common.getDefaultCurrency);
        expect(store.isCryptoUserCurrency).toBe(false);
        expect(store.getFreshChatRestoreIdLoaded).toBe(false);
        expect(store.getFreshChatRestoreId).toBe("");
    });

    it("setUserData merges payload and marks data as loaded", () => {
        const store = useUserInfo();
        const userPayload = {
            id: 10,
            email: "user@example.com",
            nickname: "nick",
            language: "fr",
            first_name: "John",
            currency: Currencies.USD,
        };

        store.setUserData(userPayload);

        expect(store.getUserInfo.user_id).toBe(10);
        expect(store.getUserInfo.nick_name).toBe("nick");
        expect(store.getUserInfo.locale).toBe("fr");
        expect(store.getUserNickName).toBe("nick");
        expect(store.getUserCurrency).toBe(Currencies.USD);
        expect(store.getUserInfo.userDataIsSet).toBe(true);
        expect(store.getIsLoadedUsedData).toBe(true);
    });

    it("clearUserData resets info and login state", () => {
        const store = useUserInfo();

        store.setUserData({ id: 1, email: "test@example.com" });
        store.toggleUserIsLogged(true);

        store.clearUserData();

        expect(store.getUserInfo.user_id).toBe("");
        expect(store.getUserInfo.email).toBe("");
        expect(store.getIsLogged).toBe(false);
    });

    it("addUserStatuses replaces existing status with the same id", () => {
        const store = useUserInfo();
        const initialStatuses: IUserStatus[] = [
            { id: 1, name: "old", slug: "old" },
            { id: 2, name: "second", slug: "second" },
        ];
        const updatedStatus: IUserStatus = { id: 1, name: "new", slug: "new" };

        store.setUserStatuses(initialStatuses);
        store.addUserStatuses(updatedStatus);

        expect(store.getUserInfo.statuses).toHaveLength(2);
        expect(store.getUserInfo.statuses.find(({ id }) => id === 1)).toEqual(updatedStatus);
    });

    it("getSubunitsToUnitsByCode returns correct subunits for currencies", () => {
        const store = useUserInfo();
        const common = useCommon();

        common.setCurrencies([
            {
                code: Currencies.USD,
                symbol: "$",
                subunits_to_unit: 100,
                fiat: true,
                default: true,
                subcurrencies: [],
            },
        ]);

        expect(store.getSubunitsToUnitsByCode(Currencies.USD)).toBe(100);
    });

    it("setFreshChatRestoreId updates id and loaded flag", () => {
        const store = useUserInfo();

        store.setFreshChatRestoreIdLoaded(false);
        store.setFreshChatRestoreId("restore");
        store.setFreshChatRestoreIdLoaded();

        expect(store.getFreshChatRestoreIdLoaded).toBe(true);
        expect(store.getFreshChatRestoreId).toBe("restore");
    });

    it("setUserSubscriptions and setUserSettings update store state", () => {
        const store = useUserInfo();
        const subscriptions: ISubscriptions = {
            receive_promos: true,
            receive_sms_promos: false,
            receive_promos_via_phone_calls: false,
            agreed_to_partner_promotions: true,
        };
        const settings: IUserSettings = {
            cent: {
                user: "user",
                timestamp: "ts",
                token: "token",
                authEndpoint: "auth",
                url: "url",
            },
            recaptcha: "recaptcha",
            recaptcha_version: 3,
        };

        store.setUserSubscriptions(subscriptions);
        store.setUserSettings(settings);

        expect(store.getUserSubscriptions).toEqual(subscriptions);
        expect(store.getSettings).toEqual(settings);
    });

    it("setPlayerStats updates stats state", () => {
        const store = useUserInfo();
        const stats: IPlayerStats = {
            deposits_count: 2,
            deposits_sum: { BTC: 0, EUR: 100, USD: 0 },
            cashouts_sum: { BTC: 0, EUR: 50, USD: 0 },
            bets_sum: { BTC: 0, EUR: 200, USD: 0 },
            messages: { notice: "info" },
        };

        store.setPlayerStats(stats);

        expect(store.getPlayerStats).toEqual(stats);
    });

    it("setUserInfoSavedFlag toggles saved marker", () => {
        const store = useUserInfo();

        store.setUserInfoSavedFlag();
        expect((store.getUserInfo as IUserData & { saved?: boolean }).saved).toBe(true);

        store.setUserInfoSavedFlag(false);
        expect((store.getUserInfo as IUserData & { saved?: boolean }).saved).toBe(false);
    });

    it("setBettingBonuses and setBettingPlayerSettings update related state", () => {
        const store = useUserInfo();
        const bonuses = [ { id: 1 } ];
        const settings = {
            oddsTypes: [ "european", "american" ],
            selectedOddsType: "american",
        };

        store.setBettingBonuses(bonuses);
        store.setBettingPlayerSettings(settings);

        expect(store.getUserBettingBonuses).toEqual(bonuses);
        expect(store.bettingPlayerSettings).toEqual(settings);
    });
});
