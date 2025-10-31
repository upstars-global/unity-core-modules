import {
    getTargetWallets,
    srcPaymentImage,
} from "@config/cashbox";
import { storeToRefs } from "pinia";

import { log } from "../controllers/Logger";
import { ICoinspaidAddresses, IPaymentHistoryPayload, PaymentType } from "../models/cashbox";
import { Currencies } from "../models/enums/currencies";
import { IPayloadMethodFields } from "../models/PaymentsLib";
import { EventBus } from "../plugins/EventBus";
import { useCashboxStore } from "../store/cashboxStore";
import { useCommon } from "../store/common";
import { useUserBalance } from "../store/user/userBalance";
import { useUserInfo } from "../store/user/userInfo";
import { ActionsTransaction } from "./api/DTO/cashbox";
import { cancelWithdrawRequestByID, loadPlayerPayments, PAYMENTS_PAGE_SIZE } from "./api/requests/player";
import { usePaymentsAPI } from "./paymentsAPI";

export function useCashBoxService() {
    const {
        coinspaidAddresses,
        paymentHistory,
        historyDeposits,
        historyPayouts,
        paymentSystems,
        payoutSystems,
        currentPage,
    } = storeToRefs(useCashboxStore());
    const { isExistPaymentsAPI, getPaymentMethods, resetCache, getPaymentMethodFields } = usePaymentsAPI();

    async function loadUserCoinspaidAddresses(): Promise<ICoinspaidAddresses> {
        if (!isExistPaymentsAPI()) {
            return;
        }
        try {
            const { userWallets } = storeToRefs(useUserBalance());

            const targetWallets = getTargetWallets(userWallets.value);
            const arrayPaymentMethods = await Promise.all(
                targetWallets.map((currency) => {
                    return getPaymentMethods(currency, ActionsTransaction.DEPOSIT);
                }),
            );

            const depositInfoOfMethodsPromises = arrayPaymentMethods.flat().map(async (item) => {
                const getMethodFieldsPayload: IPayloadMethodFields = {
                    id: item.id,
                    currency: item.termsOfService.restrictions.amountCurrencyCode,
                    paymentAction: ActionsTransaction.DEPOSIT,
                };

                const { methodFields } = await getPaymentMethodFields(getMethodFieldsPayload);
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

    async function loadPlayerPaymentsHistory({ type = "", currency = "", page = 1 } = {}): Promise<void> {
        const newPayments = await loadPlayerPayments({ type, currency, page });

        currentPage.value[type] = page;
        paymentHistory.value = page === 1 ? newPayments : [ ...paymentHistory.value, ...newPayments ];

        historyDeposits.value = paymentHistory.value.filter((item) => item.action === ActionsTransaction.DEPOSIT);
        historyPayouts.value = paymentHistory.value.filter((item) => item.action === ActionsTransaction.CASHOUT);
    }

    async function loadMorePayments({ type = "", currency = "" } = {}): Promise<void> {
        await loadPlayerPaymentsHistory({ type, currency, page: currentPage.value[type] + 1 });
    }

    async function removeWithdrawRequestById(id: number): Promise<void> {
        const { loadUserBalance } = useUserBalance();

        await cancelWithdrawRequestByID(id);
        await loadPlayerPaymentsHistory();
        await loadUserBalance();
    }

    async function getPaymentsApiMethods(currencyCode: Currencies, counter = 0) {
        const PAYMENTS_ACTIONS = [ ActionsTransaction.DEPOSIT, ActionsTransaction.CASHOUT ];

        const [ depositMethods, cashoutMethods ] = await Promise.all(
            PAYMENTS_ACTIONS.map((paymentAction) => {
                return getPaymentMethods(currencyCode, paymentAction);
            }),
        );

        if ((!depositMethods.length || !cashoutMethods.length) && counter < 3) {
            return getPaymentsApiMethods(currencyCode, counter + 1);
        }

        return [ depositMethods, cashoutMethods ];
    }

    async function loadPaymentMethods({ reload } = { reload: false }): Promise<void> {
        if (!isExistPaymentsAPI()) {
            return;
        }
        const { getUserInfo: userInfo } = storeToRefs(useUserInfo());
        const { getDefaultCurrency } = storeToRefs(useCommon());
        const currencyCode = userInfo.value.currency || getDefaultCurrency.value;
        try {
            if (reload) {
                await resetCache();
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
        loadUserCoinspaidAddresses,
        loadPlayerPaymentsHistory,
        loadMorePayments,
        removeWithdrawRequestById,
        getPaymentsApiMethods,
        loadPaymentMethods,
        PAYMENTS_PAGE_SIZE,
    };
}
