import {
    getTargetWallets,
    srcPaymentImage,
} from "@config/cashbox";
import { storeToRefs } from "pinia";

import { log } from "../controllers/Logger";
import type { ICoinspaidAddresses } from "../models/cashbox";
import { Currencies } from "../models/enums/currencies";
import { IPayloadMethodFields } from "../models/PaymentsLib";
import { EventBus } from "../plugins/EventBus";
import { useCashboxStore } from "../store/cashboxStore";
import { useCommon } from "../store/common";
import { useUserBalance } from "../store/user/userBalance";
import { useUserInfo } from "../store/user/userInfo";
import { ActionsTransaction } from "./api/DTO/cashbox";
import { loadCashboxPresetsReq } from "./api/requests/configs";
import { cancelWithdrawRequestByID, loadPlayerPayments } from "./api/requests/player";
import { usePaymentsAPI } from "./paymentsAPI";

export function useCashBoxService() {
    const {
        coinspaidAddresses,
        paymentHistory,
        historyDeposits,
        historyPayouts,
        paymentSystems,
        payoutSystems,
        hasMorePages,
    } = storeToRefs(useCashboxStore());
    const { isExistPaymentsAPI, getPaymentMethods, resetCache, getPaymentMethodFields } = usePaymentsAPI();


    async function loadUserCoinspaidAddresses(): Promise<ICoinspaidAddresses> { // TODO: maybe remove?!
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

    async function loadPlayerPaymentsHistory(
        payload: { type?: string; page?: number; pageSize?: number } = {},
    ): Promise<{ hasMore: boolean }> {
        const { type = "", page = 1, pageSize = 20 } = payload;
        const { items, pagination } = await loadPlayerPayments({ type, page, pageSize });
        const isFirstPage = page === 1;

        if (type === ActionsTransaction.DEPOSIT) {
            historyDeposits.value = isFirstPage ? items : [ ...historyDeposits.value, ...items ];
        } else if (type === ActionsTransaction.CASHOUT) {
            historyPayouts.value = isFirstPage ? items : [ ...historyPayouts.value, ...items ];
        } else {
            paymentHistory.value = isFirstPage ? items : [ ...paymentHistory.value, ...items ];
            historyDeposits.value = paymentHistory.value.filter((item) => item.action === ActionsTransaction.DEPOSIT);
            historyPayouts.value = paymentHistory.value.filter((item) => item.action === ActionsTransaction.CASHOUT);
        }

        const hasMore = pagination.page * pagination.per_page < pagination.total_count;
        hasMorePages.value[type] = hasMore;
        return { hasMore };
    }

    async function removeWithdrawRequestById(id: number): Promise<void> {
        const { loadUserBalance } = useUserBalance();

        await cancelWithdrawRequestByID(id);
        loadPlayerPaymentsHistory();
        loadUserBalance();
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

    async function loadCashboxPresets() {
        try {
            const cashboxStore = useCashboxStore();
            const data = await loadCashboxPresetsReq();

            cashboxStore.setCashboxPresets(data);
        } catch (err) {
            log.error("LOAD_CASHBOX_PRESETS_ERROR", err);
        }
    }


    return {
        loadUserCoinspaidAddresses,
        loadPlayerPaymentsHistory,
        removeWithdrawRequestById,
        getPaymentsApiMethods,
        loadPaymentMethods,
        loadCashboxPresets,
    };
}
