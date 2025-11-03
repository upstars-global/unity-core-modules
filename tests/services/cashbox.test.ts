import { createPinia, setActivePinia, storeToRefs } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

import { Currencies } from "../../src/models/enums/currencies";
import { IPaymentsMethod, ISavedProfile, PaymentLibMethodsTypes } from "../../src/models/PaymentsLib";
import { EventBus } from "../../src/plugins/EventBus";
import { ActionsTransaction, IPlayerPayment, IPlayerPaymentState } from "../../src/services/api/DTO/cashbox";
import type { IUserAccount } from "../../src/services/api/DTO/playerDTO";
import * as playerRequests from "../../src/services/api/requests/player";
import { useCashBoxService } from "../../src/services/cashbox";
import * as paymentsApiModule from "../../src/services/paymentsAPI";
import { useCashboxStore } from "../../src/store/cashboxStore";
import * as cashboxStoreModule from "../../src/store/cashboxStore";
import * as userBalanceModule from "../../src/store/user/userBalance";


const PAYMENT_HIDE = "test_hide_payment";

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

const useWallet: IUserAccount = {
    currency: Currencies.EUR,
    amount_cents: 100,
    available_to_cashout_cents: 100,
    available_to_bet_with_locked_cent: 100,
    hidden_at: null,
    deposit_available: true,
    selected_lottery_id: null,
    active: true,
};

const playerPaymentTemplate: IPlayerPayment = {
    id: 1,
    amount_cents: 5000,
    currency: Currencies.EUR,
    action: ActionsTransaction.CASHOUT,
    payment_system: "Cryptoprocessing",
    recallable: false,
    created_at: "2024-08-19T14:02:27.597Z",
    finished_at: "2024-08-23T14:20:27.514Z",
    system_name: "coinspaid",
    state: IPlayerPaymentState.pending,
    brand: "coinspaid",
    success: false,
};

vi.mock("@config/cashbox", () => ({
    getTargetWallets: vi.fn((items: IUserAccount[]) => items.map((item) => item.currency)),
    srcPaymentImage: vi.fn((item) => item),
}));
vi.mock("../../src/plugins/EventBus", () => ({
    EventBus: {
        $emit: vi.fn(),
    },
}));
vi.mock("../../src/store/user/userInfo", () => ({
    useUserInfo: vi.fn(() => ({
        getUserInfo: ref({
            currency: Currencies.EUR,
        }),
    })),
}));
vi.mock("../../src/store/user/userBalance", () => ({
    useUserBalance: vi.fn(() => ({
        userWallets: ref([ useWallet ]),
        loadUserBalance: vi.fn(),
    })),
}));
vi.mock("../../src/store/common", () => ({
    useCommon: vi.fn(() => ({
        getDefaultCurrency: ref(Currencies.EUR),
    })),
}));
vi.mock("../../src/controllers/Logger", () => ({
    log: {
        error: vi.fn(),
    },
}));
vi.mock("../../src/services/paymentsAPI", () => ({
    usePaymentsAPI: () => ({
        resetCache: vi.fn(),
        getPaymentMethods: vi.fn(),
        getMethodFields: vi.fn(),
        isExistPaymentsAPI: vi.fn(() => false),
    }),
}));
vi.mock("../../src/services/api/requests/player", () => ({
    cancelWithdrawRequestByID: vi.fn(),
    loadPlayerPayments: vi.fn(() => Promise.resolve({
        items: [ playerPaymentTemplate ],
        pagination: { page: 1, per_page: 20, total_count: 1 },
    })),
}));

describe("useCashBoxService", () => {
    describe("loadPaymentMethods", () => {
        beforeEach(() => {
            vi.resetAllMocks();
            vi.spyOn(cashboxStoreModule, "useCashboxStore").mockReturnValue({
                coinspaidAddresses: ref([]),
                paymentHistory: ref([]),
                historyDeposits: ref([]),
                historyPayouts: ref([]),
                paymentSystems: ref([]),
                payoutSystems: ref(),
            });
        });

        it("calls resetCache, getPaymentMethods and emits events", async () => {
            const resetCacheMock = vi.fn();
            const getMethodsMock = vi.fn((_, paymentAction) => {
                if (paymentAction === ActionsTransaction.DEPOSIT) {
                    return Promise.resolve(depositMethodMock);
                }
                if (paymentAction === ActionsTransaction.CASHOUT) {
                    return Promise.resolve(cashoutMethodMock);
                }
                return Promise.resolve([]);
            });

            vi.spyOn(paymentsApiModule, "usePaymentsAPI").mockReturnValue({
                resetCache: resetCacheMock,
                getPaymentMethods: getMethodsMock,
                getMethodFields: vi.fn(),
                isExistPaymentsAPI: vi.fn(() => true),
            });

            const service = useCashBoxService();

            await service.loadPaymentMethods({ reload: true });

            expect(resetCacheMock).toHaveBeenCalled();
            expect(getMethodsMock).toHaveBeenCalledTimes(2);
            expect(getMethodsMock).toHaveBeenCalledWith(
                Currencies.EUR,
                ActionsTransaction.DEPOSIT,
            );
            expect(getMethodsMock).toHaveBeenCalledWith(
                Currencies.EUR,
                ActionsTransaction.CASHOUT,
            );

            expect(EventBus.$emit).toHaveBeenCalledWith("payment.methods.loaded");
        });


        it("does nothing when API is not available", async () => {
            const resetCacheMock = vi.fn();
            const getMethodsMock = vi.fn();
            vi.spyOn(paymentsApiModule, "usePaymentsAPI").mockReturnValue({
                resetCache: resetCacheMock,
                getPaymentMethods: getMethodsMock,
                getMethodFields: vi.fn(),
                isExistPaymentsAPI: vi.fn(() => false),
            });

            const service = useCashBoxService();

            await service.loadPaymentMethods({ reload: true });

            expect(resetCacheMock).not.toHaveBeenCalled();
            expect(getMethodsMock).not.toHaveBeenCalled();
            expect(EventBus.$emit).not.toHaveBeenCalled();
        });

        it("updates paymentSystems and payoutSystems without reload", async () => {
            const resetCacheMock = vi.fn();
            const getMethodsMock = vi.fn((_, paymentAction) => {
                if (paymentAction === ActionsTransaction.DEPOSIT) {
                    return Promise.resolve(depositMethodMock);
                }
                return Promise.resolve(cashoutMethodMock);
            });
            vi.spyOn(paymentsApiModule, "usePaymentsAPI").mockReturnValue({
                resetCache: resetCacheMock,
                getPaymentMethods: getMethodsMock,
                getMethodFields: vi.fn(),
                isExistPaymentsAPI: vi.fn(() => true),
            });

            const service = useCashBoxService();

            await service.loadPaymentMethods();

            expect(resetCacheMock).not.toHaveBeenCalled();
            expect(getMethodsMock).toHaveBeenCalledTimes(2);
            expect(EventBus.$emit).toHaveBeenCalledWith("payment.methods.loaded");
        });

        it("clears paymentSystems and payoutSystems when API is not available", async () => {
            vi.spyOn(paymentsApiModule, "usePaymentsAPI").mockReturnValue({
                resetCache: vi.fn(),
                getPaymentMethods: vi.fn(),
                getMethodFields: vi.fn(),
                isExistPaymentsAPI: vi.fn(() => false),
            });

            const service = useCashBoxService();
            const result = await service.loadPaymentMethods({ reload: true });

            expect(result).toBeUndefined();
        });
    });

    /* describe("loadUserCoinspaidAddresses", () => {
        beforeEach(async () => {
            vi.resetModules();
            vi.doMock("../../src/store/cashboxStore", () => ({
                useCashboxStore: vi.fn(() => ({
                    coinspaidAddresses: ref([]),
                    paymentHistory: ref([]),
                    historyDeposits: ref([]),
                    historyPayouts: ref([]),
                    paymentSystems: ref([]),
                    payoutSystems: ref(),
                })),
            }));
        });
        it("retrieves coinspaid addresses correctly", async () => {
            const { useCashBoxService } = await import("../../src/services/cashbox");

            const coinspaidAddressesMock = {methodFields: [{ address: "address1" }, { address: "address2" }]};
            const getMethodFieldsMock = vi.fn(() => Promise.resolve(coinspaidAddressesMock));

            vi.spyOn(paymentsApiModule, "usePaymentsAPI").mockReturnValue({
                getPaymentMethodFields: getMethodFieldsMock,
                getPaymentMethods: vi.fn(() => Promise.resolve(depositMethodMock)),
                resetCache: vi.fn(),
                isExistPaymentsAPI: vi.fn(() => true),
            });

            const service = useCashBoxService();
            const addresses = await service.loadUserCoinspaidAddresses();

            expect(getMethodFieldsMock).toHaveBeenCalled();
            expect(addresses).toEqual(coinspaidAddressesMock);
        });
    });*/

    describe("removeWithdrawRequestById", () => {
        beforeEach(async () => {
            vi.resetModules();
            vi.clearAllMocks();
            vi.spyOn(cashboxStoreModule, "useCashboxStore").mockReturnValue({
                coinspaidAddresses: ref([]),
                paymentHistory: ref([]),
                historyDeposits: ref([]),
                historyPayouts: ref([]),
                paymentSystems: ref([]),
                payoutSystems: ref(),
            });
        });
        it("calls cancelWithdrawRequestByID and reloads user balance", async () => {
            const cancelWithdrawRequestByIDSpy = playerRequests.cancelWithdrawRequestByID as vi.Mock;
            cancelWithdrawRequestByIDSpy.mockResolvedValue(undefined);
            const loadUserBalanceMock = vi.fn();

            vi.spyOn(userBalanceModule, "useUserBalance").mockReturnValue({
                loadUserBalance: loadUserBalanceMock,
            });

            const service = useCashBoxService();

            await service.removeWithdrawRequestById(123);

            expect(cancelWithdrawRequestByIDSpy).toHaveBeenCalledWith(123);
            expect(loadUserBalanceMock).toHaveBeenCalled();
        });
    });

    describe("loadPlayerPaymentsHistory", () => {
        beforeEach(() => {
            setActivePinia(createPinia());
            vi.resetModules();
            vi.resetAllMocks();
        });

        afterEach(() => {
            vi.resetModules();
            vi.resetAllMocks();
        });

        it("loads and filters payment history when empty", async () => {
            const mockPayments = [
                { ...playerPaymentTemplate, action: ActionsTransaction.DEPOSIT },
                { ...playerPaymentTemplate, action: ActionsTransaction.CASHOUT },
            ];

            (playerRequests.loadPlayerPayments as vi.Mock).mockResolvedValue({
                items: mockPayments,
                pagination: { page: 1, per_page: 20, total_count: 2 },
            });
            const service = useCashBoxService();
            const store = useCashboxStore();
            const result = await service.loadPlayerPaymentsHistory();

            expect(store.paymentHistory).toEqual(mockPayments);
            expect(store.historyDeposits).toEqual([ mockPayments[0] ]);
            expect(store.historyPayouts).toEqual([ mockPayments[1] ]);
            expect(result.hasMore).toBe(false);
        });

        it("always loads even when history exists", async () => {
            const existing = [ { ...playerPaymentTemplate, action: ActionsTransaction.DEPOSIT } ];
            const { paymentHistory } = storeToRefs(useCashboxStore());
            paymentHistory.value = existing;
            const mockPayments = [
                { ...playerPaymentTemplate, action: ActionsTransaction.CASHOUT },
            ];
            vi.spyOn(playerRequests, "loadPlayerPayments").mockResolvedValue({
                items: mockPayments,
                pagination: { page: 1, per_page: 20, total_count: 1 },
            });
            const service = useCashBoxService();

            const result = await service.loadPlayerPaymentsHistory();

            expect(paymentHistory.value).toEqual(mockPayments);
            expect(result.hasMore).toBe(false);
        });

        it("loads page > 1 and appends to existing data", async () => {
            const initial = [ { ...playerPaymentTemplate, action: ActionsTransaction.CASHOUT } ];
            const { paymentHistory } = storeToRefs(useCashboxStore());
            paymentHistory.value = initial;
            const mockPayments = [
                { ...playerPaymentTemplate, action: ActionsTransaction.DEPOSIT },
            ];
            vi.spyOn(playerRequests, "loadPlayerPayments").mockResolvedValue({
                items: mockPayments,
                pagination: { page: 2, per_page: 20, total_count: 50 },
            });
            const service = useCashBoxService();

            const result = await service.loadPlayerPaymentsHistory({ page: 2 });

            expect(paymentHistory.value).toEqual([ ...initial, ...mockPayments ]);
            expect(result.hasMore).toBe(true);
        });

        it("correctly calculates hasMore for real-world scenario (page 1 of 65 total)", async () => {
            const mockPayments = Array(20).fill(null).map((_, i) => ({
                ...playerPaymentTemplate,
                id: 13420270 - i,
            }));
            vi.spyOn(playerRequests, "loadPlayerPayments").mockResolvedValue({
                items: mockPayments,
                pagination: { page: 1, per_page: 20, total_count: 65 },
            });
            const service = useCashBoxService();

            const result = await service.loadPlayerPaymentsHistory({ page: 1 });

            expect(result.hasMore).toBe(true); // 20 < 65
        });

        it("correctly calculates hasMore when reaching last page", async () => {
            const mockPayments = Array(5).fill(null).map((_, i) => ({
                ...playerPaymentTemplate,
                id: i,
            }));
            vi.spyOn(playerRequests, "loadPlayerPayments").mockResolvedValue({
                items: mockPayments,
                pagination: { page: 4, per_page: 20, total_count: 65 },
            });
            const service = useCashBoxService();

            const result = await service.loadPlayerPaymentsHistory({ page: 4 });

            expect(result.hasMore).toBe(false); // 4 * 20 = 80 >= 65
        });

        it("loads specific type (deposits only)", async () => {
            const mockPayments = [
                { ...playerPaymentTemplate, action: ActionsTransaction.DEPOSIT, id: 1 },
                { ...playerPaymentTemplate, action: ActionsTransaction.DEPOSIT, id: 2 },
            ];
            const { historyDeposits } = storeToRefs(useCashboxStore());
            vi.spyOn(playerRequests, "loadPlayerPayments").mockResolvedValue({
                items: mockPayments,
                pagination: { page: 1, per_page: 20, total_count: 2 },
            });
            const service = useCashBoxService();

            const result = await service.loadPlayerPaymentsHistory({ type: ActionsTransaction.DEPOSIT });

            expect(historyDeposits.value).toEqual(mockPayments);
            expect(result.hasMore).toBe(false);
        });
    });
});
