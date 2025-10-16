import { defineStore, storeToRefs } from "pinia";
import { computed, ref } from "vue";

import { CompPointRatesTypes, CompPointsTypes } from "../../models/enums/compPoints";
import { Currencies } from "../../models/enums/currencies";
import { type IRedeemableCards } from "../../services/api/DTO/compPoints";
import { useCMS } from "../CMS";
import { useUserInfo } from "../user/userInfo";
import { useStatusCompPointsStore } from "./statusCompPointsStore";

export function checkHasAvailableCards(list: IRedeemableCards[] | undefined, isLogged: boolean, balance: number, currency: string) {
    if (!isLogged || !balance || !list) {
        return false;
    }

    return list.some((card) => {
        let points: number | undefined = card.rate?.points;

        if (card.type === CompPointRatesTypes.MONEY) {
            points = card.rates.find((item) => item.currency === currency)?.points ||
                card.rates.find((item) => item.currency === Currencies.EUR)?.points;
        }

        return points !== undefined && balance >= points;
    });
}

export const useRedeemableCompPointsStore = defineStore("redeemableCompPointsStore", () => {
    const pageSlug: string = "rocket-mart";
    const rates = ref<Record<string, IRedeemableCards[]>>({});
    const { getIsLogged, getUserCurrency } = storeToRefs(useUserInfo());
    const { currentStaticPage } = storeToRefs(useCMS());
    const { getChargeableBalance } = storeToRefs(useStatusCompPointsStore());

    const getTabsAvailable = computed(() => {
        const types = Object.keys(CompPointsTypes);

        return types.reduce((obj, key) => {
            obj[key] =
                checkHasAvailableCards(
                    getRates.value?.[key],
                    getIsLogged.value,
                    getChargeableBalance.value,
                    getUserCurrency.value,
                );
            return obj;
        }, {} as Record<string, boolean>);
    });
    const getViewImages = computed(() => {
        if (!currentStaticPage.value?.meta.json) {
            return {};
        }

        return currentStaticPage.value.meta.json.viewImages || {};
    });
    const getPromos = computed(() => {
        if (!currentStaticPage.value?.meta.json || currentStaticPage.value.slug !== pageSlug) {
            return;
        }

        return currentStaticPage.value.meta.json.promo || null;
    });
    const getGameTitles = computed(() => {
        if (!currentStaticPage.value?.meta.json || currentStaticPage.value.slug !== pageSlug) {
            return;
        }

        return currentStaticPage.value.meta.json.gamesTitles || {};
    });
    const getMaxWin = computed(() => {
        if (!currentStaticPage.value?.meta.json ||
            currentStaticPage.value.slug !== pageSlug ||
            !currentStaticPage.value.meta.json.maxWin) {
            return "";
        }

        const maxWinByUserCurrency = currentStaticPage.value.meta.json.maxWin[getUserCurrency.value as Currencies];
        const data = {
            maxMin: maxWinByUserCurrency || currentStaticPage.value.meta.json.maxWin[Currencies.EUR],
            currency: maxWinByUserCurrency ? getUserCurrency.value : Currencies.EUR,
        };

        return `${data.maxMin} ${data.currency}`;
    });
    const getFreeSpinsWager = computed(() => {
        if (!currentStaticPage.value?.meta.json || currentStaticPage.value.slug !== pageSlug) {
            return {};
        }

        return currentStaticPage.value.meta.json.freeSpinsWager || {};
    });
    const getSpinRate = computed(() => {
        if (!currentStaticPage.value?.meta.json || currentStaticPage.value.slug !== pageSlug) {
            return {};
        }

        return currentStaticPage.value.meta.json.spinRate || {};
    });
    const getMockCards = computed(() => {
        if (!currentStaticPage.value?.meta.json || currentStaticPage.value.slug !== pageSlug) {
            return null;
        }

        return currentStaticPage.value.meta.json.cards || null;
    });
    const getRates = computed(() => (getIsLogged.value ? rates.value : getMockCards.value));


    function setRates(ratesData: Record<string, IRedeemableCards[]>) {
        rates.value = ratesData;
    }

    return {
        rates,
        getRates,
        setRates,
        getTabsAvailable,
        getViewImages,
        getPromos,
        getGameTitles,
        getMaxWin,
        getFreeSpinsWager,
        getSpinRate,
        getMockCards,
    };
});
