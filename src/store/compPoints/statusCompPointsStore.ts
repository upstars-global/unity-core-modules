import { useCommon } from "@store/common";
import { useUserInfo } from "@store/user/userInfo";
import { defineStore, storeToRefs } from "pinia";
import { computed, ref } from "vue";

import type {
    ICompPoints,
    IExchange,
    IExchangeMoneyRate,
    IExchangeMoneyRateList,
    IRate,
} from "../../services/api/DTO/compPoints";
import {
    exchangeToMoney as exchangeToMoneyReq,
    loadRatesMoney as loadRatesMoneyReq,
    loadUserCompPoints as loadUserCompPointsReq,
} from "../../services/api/requests/compPoints";

export const useStatusCompPointsStore = defineStore("statusCompPointsStore", () => {
    const { getUserCurrency } = storeToRefs(useUserInfo());
    const compPoints = ref<ICompPoints>();

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

    async function exchangeToMoney({ points, group, currency }: IExchange) {
        await exchangeToMoneyReq({ points, group, currency });
        await loadUserCompPoints();
    }

    async function loadRatesMoney() {
        const ratesResponse = await loadRatesMoneyReq();
        setRatesMoney(ratesResponse);
    }

    async function loadUserCompPoints() {
        updateCompPoints(await loadUserCompPointsReq());
    }

    function clearState() {
        compPoints.value = null;
    }

    return {
        getUserCompPoints,
        getCompPointsRate,
        getChargeableBalance,
        exchangeToMoney,
        updateCompPoints,
        getCompPoints,
        loadRatesMoney,
        loadUserCompPoints,
        clearState,
    };
});
