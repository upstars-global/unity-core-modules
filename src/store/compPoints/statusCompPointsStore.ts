import { defineStore, storeToRefs } from "pinia";
import { computed, ref } from "vue";

import type {
    ICompPoints,
    IExchangeMoneyRate,
    IExchangeMoneyRateList,
    IRate,
} from "../../services/api/DTO/compPoints";
import { useCommon } from "../common";
import { useUserInfo } from "../user/userInfo";

export const useStatusCompPointsStore = defineStore("statusCompPointsStore", () => {
    const { getUserCurrency } = storeToRefs(useUserInfo());
    const compPoints = ref<ICompPoints | null>(null);
    const ratesMoney = ref<IExchangeMoneyRateList>([]);

    const getUserCompPoints = computed<number | undefined>(() => {
        return compPoints.value?.chargeable?.points;
    });
    const getCompPoints = computed(() => {
        return compPoints.value;
    });
    const getChargeableBalance = computed(() => {
        if (!compPoints.value?.chargeable) {
            return 0;
        }
        return compPoints.value.chargeable.points;
    });
    const getStatusBalance = computed(() => {
        if (!compPoints.value?.persistent) {
            return 0;
        }
        return compPoints.value?.persistent.points;
    });

    const getCompPointsRate = computed<IRate | Record<string, unknown>>(() => {
        const currency: string = getUserCurrency.value;
        const { getDefaultCurrency } = storeToRefs(useCommon());

        const rates: IRate[] = ratesMoney.value[0]?.rates || [];

        const currentRate = rates.find((rateItem: IRate) => {
            return rateItem.currency === currency;
        });
        const defaultRate = rates.find((rateItem) => {
            return rateItem.currency === getDefaultCurrency.value;
        });
        return currentRate || defaultRate || rates[0] || {};
    });

    function setRatesMoney(rates: IExchangeMoneyRate[]) {
        ratesMoney.value = rates;
    }

    function updateCompPoints(data: ICompPoints) {
        compPoints.value = data;
    }

    function clearState() {
        compPoints.value = null;
    }

    return {
        getUserCompPoints,
        getCompPointsRate,
        getChargeableBalance,
        updateCompPoints,
        getCompPoints,
        setRatesMoney,
        getStatusBalance,
        clearState,
    };
});
