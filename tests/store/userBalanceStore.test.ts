import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

import { useUserBalance } from "../../src/store/user/userBalance";

const STORE_BALANCE_USD = {
    currency: "USD",
    active: true,
    amount_cents: 1000,
    available_to_cashout_cents: 700,
};

vi.mock("../../src/store/user/userInfo", () => {
    return {
        useUserInfo: () => ({
            getSubunitsToUnitsByCode: vi.fn(() => 100),
            getUserCurrency: ref("USD"),
        }),
    };
});
vi.mock("../../src/store/common", () => {
    return {
        useCommon: () => ({
            getCurrencyFiat: ref([ "USD", "EUR" ]),
            getCurrencyCrypto: ref([ "BTC" ]),
            isCryptoCurrency: ref((currency: string) => currency === "BTC"),
        }),
    };
});
vi.mock("../../src/store/settings", () => {
    return {
        useSettings: () => ({
            isCryptoDomain: ref(false),
        }),
    };
});
vi.mock("../../src/store/gifts", () => {
    return {
        useGiftsStore: () => ({
            giftsAll: [
                {
                    currency: "USD",
                    stage: "handle_bets",
                    amount_wager_requirement_cents: 500,
                    amount_wager_cents: 200,
                },
                {
                    currency: "USD",
                    stage: "handle_bets",
                    amount_wager_requirement_cents: 300,
                    amount_wager_cents: 100,
                },
            ],
        }),
    };
});
vi.mock("../helpers/currencyHelper", () => {
    return {
        currencyView: vi.fn((amount: number) => `${amount / 100}`),
    };
});

describe("useUserBalance store", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it("initializes with an empty balance", () => {
        const store = useUserBalance();

        expect(store.balance).toEqual([]);
        expect(store.userWallets).toEqual([]);
    });

    it("returns only active wallets", () => {
        const store = useUserBalance();

        store.balance = [
            STORE_BALANCE_USD,
            {
                currency: "EUR",
                active: false,
                amount_cents: 500,
                available_to_cashout_cents: 500,
            },
        ];

        expect(store.userWallets.length).toBe(1);
        expect(store.userWallets[0].currency).toBe("USD");
    });

    it("returns user cashout balance for selected currency", () => {
        const store = useUserBalance();

        store.balance = [
            STORE_BALANCE_USD,
        ];

        expect(store.getUserCashoutBalance).toBe(700);
    });

    it("returns user common balance", () => {
        const store = useUserBalance();

        store.balance = [
            STORE_BALANCE_USD,
        ];

        expect(store.getUserCommonBalance).toBe(1000);
    });

    it("calculates user bonus balance correctly", () => {
        const store = useUserBalance();

        store.balance = [
            STORE_BALANCE_USD,
        ];

        expect(store.getUserBonusBalance).toBe(300);
    });

    it("normalizes balances using currencyView helper", () => {
        const store = useUserBalance();

        store.balance = [
            STORE_BALANCE_USD,
        ];

        expect(store.getUserCommonBalanceNormalize).toBe("10 USD");
        expect(store.getUserRealBalanceNormalise).toBe("7 USD");
    });

    it("updates balance for a specific currency", () => {
        const store = useUserBalance();

        store.balance = [
            STORE_BALANCE_USD,
        ];

        store.updateUserBalance({
            data: { currency: "USD", active: true, amount_cents: 2000 },
        });

        expect(store.balance[0].amount_cents).toBe(2000);
    });

    it("clears store state", () => {
        const store = useUserBalance();

        store.balance = [
            STORE_BALANCE_USD,
        ];

        store.clearState();

        expect(store.balance).toEqual([]);
    });

    it("calculates total wagering requirement from gifts", () => {
        const store = useUserBalance();

        expect(store.getUserTotalWagering).toBe(800);
    });

    it("calculates current wager amount from gifts", () => {
        const store = useUserBalance();

        expect(store.getUserWager).toBe(300);
    });

    it("returns available currencies based on domain and wallets", () => {
        const store = useUserBalance();

        expect(store.getCurrencies).toEqual([ "USD", "EUR", "BTC" ]);
    });
});
