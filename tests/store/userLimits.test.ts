import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Currencies } from "../../src/models/enums/currencies";
import { type ICurrencies } from "../../src/services/api/DTO/info";
import { type ILimitAccount, type IUserLimit } from "../../src/services/api/DTO/userLimits";
import { useCommon } from "../../src/store/common";
import { useUserInfo } from "../../src/store/user/userInfo";
import { useUserLimits } from "../../src/store/user/userLimits";

const createCurrency = (overrides: Partial<ICurrencies> = {}): ICurrencies => ({
    code: Currencies.USD,
    symbol: "$",
    subunits_to_unit: 100,
    fiat: true,
    default: false,
    subcurrencies: [],
    ...overrides,
});

const createLimitAccount = (overrides: Partial<ILimitAccount> = {}): ILimitAccount => ({
    currency: Currencies.USD,
    amount_cents: 10_000,
    current_value_amount_cents: 0,
    active_until: "2024-01-01T00:00:00.000Z",
    ...overrides,
});

const createLimit = (overrides: Partial<IUserLimit> = {}): IUserLimit => ({
    period: "daily",
    status: "active",
    disable_at: null,
    confirm_until: null,
    parent_type: null,
    strategy: null,
    created_at: "2024-01-01T00:00:00.000Z",
    id: 1,
    type: "deposit",
    accounts: [ createLimitAccount() ],
    ...overrides,
});

describe("useUserLimits store", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it("initializes with empty limits", () => {
        const store = useUserLimits();

        expect(store.limits).toEqual([]);
        expect(store.getUserLimits).toEqual([]);
        expect(store.isOneLimitReached).toBe(false);
        expect(store.hasDepositLimit).toBe(false);
        expect(store.hasSomeReachedLimit).toBe(false);
    });

    it("getUserLimits filters out crypto accounts", () => {
        const commonStore = useCommon();
        commonStore.setCurrencies([
            createCurrency({ code: Currencies.USD, fiat: true }),
            createCurrency({ code: Currencies.BTC, fiat: false, symbol: "₿" }),
        ]);
        const store = useUserLimits();
        store.setUserLimits([
            createLimit({
                accounts: [
                    createLimitAccount({ currency: Currencies.BTC }),
                    createLimitAccount({ currency: Currencies.USD }),
                ],
            }),
        ]);

        expect(store.getUserLimits[0].accounts).toEqual([
            expect.objectContaining({ currency: Currencies.USD }),
        ]);
    });

    it("getLimitsByType uses filtered limits when only fiat is enabled", () => {
        const commonStore = useCommon();
        commonStore.setCurrencies([
            createCurrency({ code: Currencies.USD, fiat: true }),
            createCurrency({ code: Currencies.BTC, fiat: false, symbol: "₿" }),
        ]);
        const store = useUserLimits();
        store.setUserLimits([
            createLimit({
                type: "deposit",
                accounts: [
                    createLimitAccount({ currency: Currencies.BTC }),
                    createLimitAccount({ currency: Currencies.USD }),
                ],
            }),
        ]);

        store.setOnlyFiatLimits(true);

        const depositLimits = store.getLimitsByType("deposit");

        expect(depositLimits).toHaveLength(1);
        expect(depositLimits[0].accounts).toEqual([
            expect.objectContaining({ currency: Currencies.USD }),
        ]);
    });

    it("detects reached limits via computed flags", () => {
        const userInfoStore = useUserInfo();
        userInfoStore.info.currency = Currencies.USD;
        const store = useUserLimits();
        store.setUserLimits([
            createLimit({ type: "cooling_off" }),
            createLimit({
                id: 20,
                type: "withdrawal",
                accounts: [
                    createLimitAccount({
                        currency: Currencies.USD,
                        current_value_amount_cents: 10_000,
                    }),
                ],
            }),
            createLimit({
                id: 30,
                type: "deposit",
                accounts: [
                    createLimitAccount({
                        currency: Currencies.USD,
                        current_value_amount_cents: 10_000,
                    }),
                ],
            }),
        ]);

        expect(store.isOneLimitReached).toBe(true);
        expect(store.hasSomeReachedLimit).toBe(true);
        expect(store.hasDepositLimit).toBe(true);
        expect(store.getLimitsByType("deposit")).toHaveLength(1);
    });
});
