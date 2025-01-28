import {
    getTargetWallets,
    GROUP_HIDE_SOFORT,
    PAYMENT_HIDE_SOFORT,
    srcPaymentImage,
} from "@config/cashbox";
import { defineStore, storeToRefs } from "pinia";
import { computed, ref } from "vue";

import { log } from "../controllers/Logger";
import type { ICoinspaidAddresses } from "../models/cashbox";
import type { IPaymentsMethod } from "../models/PaymentsLib";
import type { UserGroup } from "../models/user";
import { EventBus } from "../plugins/EventBus";
import type { IPlayerPayment } from "../services/api/DTO/cashbox";
import { ActionsTransaction, TypeSystemPayment } from "../services/api/DTO/cashbox";
import { cancelWithdrawRequestByID, loadPlayerPayments } from "../services/api/requests/player";
import { useCommon } from "./common";
import { useUserBalance } from "./user/userBalance";
import { useUserInfo } from "./user/userInfo";
import { useUserStatuses } from "./user/userStatuses";

function filterPaymentsByGroup(
    paymentArray: IPaymentsMethod[],
    userGroups: UserGroup[],
    targetPaymentHide: string,
    targetUserHide: number,
): IPaymentsMethod[] {
    if (!userGroups || !targetPaymentHide || !targetUserHide) {
        return paymentArray;
    }
    const hideSofortForUser = userGroups.includes(targetUserHide);
    return paymentArray.filter((paymentItem) => {
        return !(paymentItem.brand === targetPaymentHide && hideSofortForUser);
    });
}

export const useCashboxStore = defineStore("cashboxStore", () => {
    const userStatuses = useUserStatuses();

    const paymentHistory = ref<IPlayerPayment[]>([]);
    const historyDeposits = ref<IPlayerPayment[]>([]);
    const historyPayouts = ref<IPlayerPayment[]>([]);
    const paymentSystems = ref<IPaymentsMethod[]>([]);
    const payoutSystems = ref<IPaymentsMethod[]>([]);
    const coinspaidAddresses = ref<ICoinspaidAddresses>();

    const getWithdrawRequests = computed<IPlayerPayment[]>(() => {
        return historyPayouts.value.filter((item) => {
            return item.recallable;
        });
    });

    const getPaymentSystems = computed<IPaymentsMethod[]>(() => {
        return filterPaymentsByGroup(
            paymentSystems.value,
            userStatuses.getUserGroups,
            PAYMENT_HIDE_SOFORT,
            GROUP_HIDE_SOFORT,
        );
    });

    const getPayoutSystems = computed<IPaymentsMethod[]>(() => {
        return filterPaymentsByGroup(
            payoutSystems.value,
            userStatuses.getUserGroups,
            PAYMENT_HIDE_SOFORT,
            GROUP_HIDE_SOFORT,
        );
    });

    function getSavedMethodsByType(type: TypeSystemPayment): IPaymentsMethod[] {
        const payCollectionsByType = type === TypeSystemPayment.TYPE_SYSTEM_PAYOUT ?
            getPayoutSystems :
            getPaymentSystems;

        return payCollectionsByType.value.filter(({ savedProfiles }) => savedProfiles.length);
    }

    async function loadUserCoinspaidAddresses(): Promise<ICoinspaidAddresses> {
        if (typeof window.PaymentsAPI === "undefined") {
            return;
        }
        try {
            const { userWallets } = storeToRefs(useUserBalance());
            const targetWallets = getTargetWallets(userWallets.value);
            const arrayPaymentMethods = await Promise.all(
                targetWallets.map((currency) => {
                    return window.PaymentsAPI.getMethods({ currency, paymentAction: ActionsTransaction.DEPOSIT });
                }),
            );

            const depositInfoOfMethodsPromises = arrayPaymentMethods.flat().map(async (item) => {
                const getMethodFieldsPayload = {
                    id: item.id,
                    currency: item.termsOfService.restrictions.amountCurrencyCode,
                    paymentAction: ActionsTransaction.DEPOSIT,
                };

                const { methodFields } = await window.PaymentsAPI.getMethodFields(getMethodFieldsPayload);
                return [
                    item.termsOfService.restrictions.amountCurrencyCode,
                    methodFields[0].address,
                ];
            });
            const depositInfoOfMethodsResp = await Promise.all(depositInfoOfMethodsPromises);
            const addressesForDepInList = Object.fromEntries(depositInfoOfMethodsResp) as ICoinspaidAddresses;

            coinspaidAddresses.value = addressesForDepInList;
            return addressesForDepInList;
        } catch (err) {
            log.error("LOAD_USER_COINSPAID_ADDRESSES_ERROR", err);
            throw err;
        }
    }

    async function loadPlayerPaymentsHistory({ reload = false }: { reload: boolean } = {}): Promise<void> {
        if (!paymentHistory.value.length || reload) {
            paymentHistory.value = await loadPlayerPayments();

            historyDeposits.value = paymentHistory.value.filter((item) => {
                return item.action === ActionsTransaction.DEPOSIT;
            });
            historyPayouts.value = paymentHistory.value.filter((item) => {
                return item.action === ActionsTransaction.CASHOUT;
            });
        }
    }

    async function removeWithdrawRequestById(id): Promise<void> {
        const { loadUserBalance } = useUserBalance();

        await cancelWithdrawRequestByID(id);
        loadPlayerPaymentsHistory({ reload: true });
        loadUserBalance();
    }

    async function getPaymentsApiMethods(currencyCode, counter = 0) {
        const PAYMENTS_ACTIONS = [ ActionsTransaction.DEPOSIT, ActionsTransaction.CASHOUT ];

        const [ depositMethods, cashoutMethods ] = await Promise.all(
            PAYMENTS_ACTIONS.map((paymentAction) => {
                return window?.PaymentsAPI
                    .getMethods({ currency: currencyCode, paymentAction }) as Promise<IPaymentsMethod[]>;
            }),
        );

        if ((!depositMethods.length || !cashoutMethods.length) && counter < 3) {
            return getPaymentsApiMethods(currencyCode, counter + 1);
        }

        return [ depositMethods, cashoutMethods ];
    }

    async function loadPaymentMethods({ reload } = { reload: false }): Promise<void> {
        if (typeof window?.PaymentsAPI === "undefined") {
            return;
        }
        const { getUserInfo: userInfo } = storeToRefs(useUserInfo());
        const { getDefaultCurrency } = storeToRefs(useCommon());
        const currencyCode = userInfo.value.currency || getDefaultCurrency.value;
        try {
            if (reload) {
                await window.PaymentsAPI.resetCache();
            }

            const [ depositMethods, cashoutMethods ] = await getPaymentsApiMethods(currencyCode);

            paymentSystems.value = depositMethods.map(srcPaymentImage);
            payoutSystems.value = cashoutMethods.map(srcPaymentImage);

            EventBus.$emit("payment.methods.loaded");
        } catch (err) {
            log.error("LOAD_PAYMENT_METHODS_ERROR", err);
        }
    }

    return {
        getWithdrawRequests,

        loadUserCoinspaidAddresses,

        paymentHistory,
        historyDeposits,
        historyPayouts,
        loadPlayerPaymentsHistory,

        removeWithdrawRequestById,

        paymentSystems,
        payoutSystems,
        coinspaidAddresses,
        getPaymentSystems,
        getPayoutSystems,
        getSavedMethodsByType,
        loadPaymentMethods,
    };
});
