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
const currencyFiat = ref([ "USD", "EUR" ]);
const currencyCrypto = ref([ "BTC" ]);
const isCryptoCurrency = ref((currency: string) => currency === "BTC");
const isCryptoDomain = ref(false);

vi.mock("../../src/store/common", () => {
    return {
        useCommon: () => ({
            getCurrencyFiat: currencyFiat,
            getCurrencyCrypto: currencyCrypto,
            isCryptoCurrency,
        }),
    };
});
vi.mock("../../src/store/settings", () => {
    return {
        useSettings: () => ({
            isCryptoDomain,
        }),
    };
});
const giftsAll = ref([
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
]);
vi.mock("../../src/store/gifts", () => {
    return {
        useGiftsStore: () => ({
            giftsAll: giftsAll.value,
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
        giftsAll.value = [
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
        ];
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

    it("returns 0 cashout balance when currency is missing", () => {
        const store = useUserBalance();
        store.balance = [
            {
                currency: "EUR",
                active: true,
                amount_cents: 500,
                available_to_cashout_cents: 200,
            },
        ];

        expect(store.getUserCashoutBalance).toBe(0);
    });

    it("returns user common balance", () => {
        const store = useUserBalance();

        store.balance = [
            STORE_BALANCE_USD,
        ];

        expect(store.getUserCommonBalance).toBe(1000);
    });

    it("returns 0 common balance when currency is missing", () => {
        const store = useUserBalance();
        store.balance = [
            {
                currency: "EUR",
                active: true,
                amount_cents: 500,
                available_to_cashout_cents: 200,
            },
        ];

        expect(store.getUserCommonBalance).toBe(0);
        expect(store.getUserCommonBalanceNormalize).toBe("0 USD");
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
        expect(store.getUserBonusBalanceNormalize).toBe("3 USD");
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

    it("ignores gifts that do not match currency or stage", () => {
        giftsAll.value = [
            {
                currency: "EUR",
                stage: "handle_bets",
                amount_wager_requirement_cents: 500,
                amount_wager_cents: 200,
            },
            {
                currency: "USD",
                stage: "issued",
                amount_wager_requirement_cents: 300,
                amount_wager_cents: 100,
            },
        ];
        const store = useUserBalance();

        expect(store.getUserTotalWagering).toBe(0);
        expect(store.getUserWager).toBe(0);
    });

    it("returns available currencies based on domain and wallets", () => {
        const store = useUserBalance();

        expect(store.getCurrencies).toEqual([ "USD", "EUR", "BTC" ]);
    });

    it("returns only crypto currencies on crypto domain without fiat wallets", () => {
        const store = useUserBalance();
        isCryptoDomain.value = true;
        currencyFiat.value = [ "USD" ];
        currencyCrypto.value = [ "BTC", "ETH" ];
        isCryptoCurrency.value = (currency: string) => currency !== "USD";

        store.balance = [
            {
                currency: "BTC",
                active: true,
                amount_cents: 100,
                available_to_cashout_cents: 50,
            },
        ];

        expect(store.getCurrencies).toEqual([ "BTC", "ETH" ]);
    });
});
