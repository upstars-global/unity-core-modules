import { CoinShopPageSlug } from "@config/compPoints";
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
    const getPageContent = computed(() => {
        return currentStaticPage.value?.meta.json || currentStaticPage.value?.slug === CoinShopPageSlug ?
            currentStaticPage.value?.meta.json
            : {};
    });
    const getViewImages = computed(() => {
        return getPageContent.value?.viewImages || {};
    });
    const getPromos = computed(() => {
        return getPageContent.value?.promo || null;
    });
    const getGameTitles = computed(() => {
        return getPageContent.value?.gamesTitles || {};
    });
    const getMaxWin = computed(() => {
        if (!getPageContent.value) {
            return "";
        }

        const maxWin = getPageContent.value?.maxWin;
        const maxWinByUserCurrency = maxWin[getUserCurrency.value as Currencies];
        const data = {
            maxMin: maxWinByUserCurrency || currentStaticPage.value.meta.json.maxWin[Currencies.EUR],
            currency: maxWinByUserCurrency ? getUserCurrency.value : Currencies.EUR,
        };

        return `${data.maxMin} ${data.currency}`;
    });
    const getFreeSpinsWager = computed(() => {
        return getPageContent.value?.freeSpinsWager || {};
    });
    const getSpinRate = computed(() => {
        return getPageContent.value?.spinRate || {};
    });
    const getMockCards = computed(() => {
        return getPageContent.value?.cards || null;
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
