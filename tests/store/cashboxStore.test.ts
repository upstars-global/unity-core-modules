import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

import { Currencies } from "../../src/models/enums/currencies";
import type { IPaymentsMethod } from "../../src/models/PaymentsLib";
import { ISavedProfile, PaymentLibMethodsTypes } from "../../src/models/PaymentsLib";
import {
    ActionsTransaction,
    IPlayerPayment,
    IPlayerPaymentState,
    TypeSystemPayment,
} from "../../src/services/api/DTO/cashbox";
import { useCashboxStore } from "../../src/store/cashboxStore";
import * as userStatusesModule from "../../src/store/user/userStatuses";

const PAYMENT_HIDE = "test_hide_payment";
const GROUP_HIDE = 100;

const savedProfileMock: ISavedProfile = {
    id: "1",
    isRemoveAvailable: true,
    title: "test",
};
const paymentTemplate: IPaymentsMethod = {
    id: "creditCard",
    translationKey: "creditCard",
    title: "Credit card",
    description: null,
    iconSrc: null,
    savedProfiles: [],
    isForSavedProfilesOnly: false,
    isProfileRequiredForCashout: false,
    termsOfService: {
        processingTime: {
            type: "instant",
        },
        commissions: {
            type: "none",
        },
        restrictions: {
            minAmountValue: 25,
            maxAmountValue: 6000,
            amountCurrencyCode: "AUD",
        },
    },
    type: PaymentLibMethodsTypes.Cards,
    provider: "test_provider",
    brand: "",
    originBrand: "creditCard",
    image: "creditCard.svg",
    index: 0,
};

const depositMethodMock: IPaymentsMethod[] = [
    {
        ...paymentTemplate,
        brand: PAYMENT_HIDE,
    },
    {
        ...paymentTemplate,
        savedProfiles: [ savedProfileMock ],
    },
];

const cashoutMethodMock: IPaymentsMethod[] = [
    {
        ...paymentTemplate,
        brand: PAYMENT_HIDE,
    },
    {
        ...paymentTemplate,
        savedProfiles: [ savedProfileMock ],
    },
];

const historyPayoutsMock: IPlayerPayment[] = [
    {
        id: 1,
        amount_cents: 5000,
        currency: Currencies.EUR,
        action: ActionsTransaction.CASHOUT,
        payment_system: "Cryptoprocessing",
        recallable: false,
        created_at: "2024-08-19T14:02:27.597Z",
        finished_at: "2024-08-23T14:20:27.514Z",
        system_name: "coinspaid",
        state: IPlayerPaymentState.recalled,
        brand: "coinspaid",
        success: false,
    },
    {
        id: 2,
        amount_cents: 5000,
        currency: Currencies.EUR,
        action: ActionsTransaction.CASHOUT,
        payment_system: "Cryptoprocessing",
        recallable: false,
        created_at: "2024-08-19T14:02:27.597Z",
        finished_at: "2024-08-23T14:20:27.514Z",
        system_name: "coinspaid",
        state: IPlayerPaymentState.recalled,
        brand: "coinspaid",
        success: false,
    },
    {
        id: 3,
        amount_cents: 5000,
        currency: Currencies.EUR,
        action: ActionsTransaction.CASHOUT,
        payment_system: "Cryptoprocessing",
        recallable: true,
        created_at: "2024-08-19T14:02:27.597Z",
        finished_at: "2024-08-23T14:20:27.514Z",
        system_name: "coinspaid",
        state: IPlayerPaymentState.recalled,
        brand: "coinspaid",
        success: false,
    },
];
vi.mock("@config/cashbox", () => ({
    GROUP_HIDE_SOFORT: 100, // GROUP_HIDE
    PAYMENT_HIDE_SOFORT: "test_hide_payment", // PAYMENT_HIDE
}));

vi.mock("../../src/store/user/userStatuses", () => ({
    useUserStatuses: vi.fn(() => ({
        getUserGroups: ref(false), // Используем ref() для реактивного состояния
    })),
}));

describe("cashboxStore", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it("initializes the store with default empty state", () => {
        const store = useCashboxStore();

        expect(store.paymentHistory).toEqual([]);
        expect(store.historyDeposits).toEqual([]);
        expect(store.historyPayouts).toEqual([]);
        expect(store.paymentSystems).toEqual([]);
        expect(store.payoutSystems).toEqual([]);
        expect(store.coinspaidAddresses).toBeUndefined();
    });

    it("returns only recallable payout requests from history", () => {
        const store = useCashboxStore();
        store.historyPayouts = historyPayoutsMock;

        expect(store.getWithdrawRequests.length).toEqual(1);
    });

    it("resetHistory clears histories and resets hasMorePages flags", () => {
        const store = useCashboxStore();
        store.paymentHistory = historyPayoutsMock;
        store.historyDeposits = historyPayoutsMock;
        store.historyPayouts = historyPayoutsMock;
        store.hasMorePages = {
            "": false,
            "deposit": false,
            "cashout": false,
        };

        store.resetHistory();

        expect(store.paymentHistory).toEqual([]);
        expect(store.historyDeposits).toEqual([]);
        expect(store.historyPayouts).toEqual([]);
        expect(store.hasMorePages).toEqual({
            "": true,
            "deposit": true,
            "cashout": true,
        });
    });

    it("sets cashbox presets and manage withdraw configs", () => {
        const store = useCashboxStore();
        const presets = { deposit: { key: "value" } } as const;
        const manageWithdraw = { availability: { key: "value" } } as const;

        store.setCashboxPresets(presets as never);
        store.setManageWithdraw(manageWithdraw as never);

        expect(store.cashboxPresets).toEqual(presets);
        expect(store.manageWithdraw).toEqual(manageWithdraw);
    });

    describe("getPaymentSystems", () => {
        it.each([
            { groups: [ GROUP_HIDE ], expected: 1, desc: "filters hidden brands by group" },
            { groups: [ 102 ], expected: depositMethodMock.length, desc: "does not filter if group doesn't match" },
            { groups: [], expected: depositMethodMock.length, desc: "returns all if userGroups is empty" },
        ])("returns correct number of deposit methods when $desc", ({ groups, expected }) => {
            vi.spyOn(userStatusesModule, "useUserStatuses").mockReturnValue({
                getUserGroups: groups,
            });
            const store = useCashboxStore();
            store.paymentSystems = depositMethodMock;

            expect(store.getPaymentSystems.length).toBe(expected);
        });

        it("returns all when userGroups is falsy", () => {
            vi.spyOn(userStatusesModule, "useUserStatuses").mockReturnValue({
                getUserGroups: null as never,
            });
            const store = useCashboxStore();
            store.paymentSystems = depositMethodMock;

            expect(store.getPaymentSystems).toHaveLength(depositMethodMock.length);
        });
    });

    describe("getPayoutSystems", () => {
        it.each([
            { groups: [ GROUP_HIDE ], expected: 1, desc: "filters hidden brands by group" },
            { groups: [ 102 ], expected: cashoutMethodMock.length, desc: "does not filter if group doesn't match" },
            { groups: [], expected: cashoutMethodMock.length, desc: "returns all if userGroups is empty" },
        ])("returns correct number of payout methods when $desc", ({ groups, expected }) => {
            vi.spyOn(userStatusesModule, "useUserStatuses").mockReturnValue({
                getUserGroups: groups,
            });
            const store = useCashboxStore();
            store.payoutSystems = cashoutMethodMock;

            expect(store.getPayoutSystems.length).toBe(expected);
        });
    });

    describe("getSavedMethodsByType", () => {
        it("returns only methods with savedProfiles for the given type", () => {
            const store = useCashboxStore();
            store.paymentSystems = depositMethodMock;
            store.payoutSystems = cashoutMethodMock;

            const savedDeposit = store.getSavedMethodsByType(TypeSystemPayment.TYPE_SYSTEM_PAYMENT);
            const savedPayout = store.getSavedMethodsByType(TypeSystemPayment.TYPE_SYSTEM_PAYOUT);

            expect(savedDeposit).toHaveLength(1);
            expect(savedPayout).toHaveLength(1);
        });

        it("returns empty array when no savedProfiles exist", () => {
            const store = useCashboxStore();
            store.paymentSystems = [ paymentTemplate ];
            store.payoutSystems = [ paymentTemplate ];

            const savedDeposit = store.getSavedMethodsByType(TypeSystemPayment.TYPE_SYSTEM_PAYMENT);
            const savedPayout = store.getSavedMethodsByType(TypeSystemPayment.TYPE_SYSTEM_PAYOUT);

            expect(savedDeposit).toEqual([]);
            expect(savedPayout).toEqual([]);
        });
    });
});
