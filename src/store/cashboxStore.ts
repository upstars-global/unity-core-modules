import { defineStore } from "pinia";
import { computed, ref } from "vue";

import type { ICoinspaidAddresses } from "../models/cashbox";
import type { IPaymentsMethod } from "../models/PaymentsLib";
import type { UserGroup } from "../models/user";
import type { IPlayerPayment } from "../services/api/DTO/cashbox";
import { type ICashboxPresets } from "../services/api/DTO/cashbox";
import { TypeSystemPayment } from "../services/api/DTO/cashbox";
import { useConfigStore } from "./configStore";
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
    const { $defaultProjectConfig } = useConfigStore();
    const userStatuses = useUserStatuses();

    const paymentHistory = ref<IPlayerPayment[]>([]);
    const historyDeposits = ref<IPlayerPayment[]>([]);
    const historyPayouts = ref<IPlayerPayment[]>([]);
    const paymentSystems = ref<IPaymentsMethod[]>([]);
    const payoutSystems = ref<IPaymentsMethod[]>([]);
    const coinspaidAddresses = ref<ICoinspaidAddresses>();
    const cashboxPresets = ref<ICashboxPresets>();

    const hasMorePages = ref<Record<string, boolean>>({
        "": true,
        "deposit": true,
        "cashout": true,
    });

    function resetHistory() {
        paymentHistory.value = [];
        historyDeposits.value = [];
        historyPayouts.value = [];
        hasMorePages.value = {
            "": true,
            "deposit": true,
            "cashout": true,
        };
    }

    function setCashboxPresets(value: ICashboxPresets) {
        cashboxPresets.value = value;
    }

    const getWithdrawRequests = computed<IPlayerPayment[]>(() => {
        return historyPayouts.value.filter((item) => {
            return item.recallable;
        });
    });

    const getPaymentSystems = computed<IPaymentsMethod[]>(() => {
        return filterPaymentsByGroup(
            paymentSystems.value,
            userStatuses.getUserGroups,
            $defaultProjectConfig.PAYMENT_HIDE_SOFORT,
            $defaultProjectConfig.GROUP_HIDE_SOFORT,
        );
    });

    const getPayoutSystems = computed<IPaymentsMethod[]>(() => {
        return filterPaymentsByGroup(
            payoutSystems.value,
            userStatuses.getUserGroups,
            $defaultProjectConfig.PAYMENT_HIDE_SOFORT,
            $defaultProjectConfig.GROUP_HIDE_SOFORT,
        );
    });

    function getSavedMethodsByType(type: TypeSystemPayment): IPaymentsMethod[] {
        const payCollectionsByType = type === TypeSystemPayment.TYPE_SYSTEM_PAYOUT ?
            getPayoutSystems :
            getPaymentSystems;

        return payCollectionsByType.value.filter(({ savedProfiles }) => savedProfiles.length);
    }


    return {
        getWithdrawRequests,


        paymentHistory,
        historyDeposits,
        historyPayouts,


        paymentSystems,
        payoutSystems,
        coinspaidAddresses,
        hasMorePages,
        cashboxPresets,
        getPaymentSystems,
        getPayoutSystems,
        getSavedMethodsByType,

        resetHistory,
        setCashboxPresets,
    };
});
