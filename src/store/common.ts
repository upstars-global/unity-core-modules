import { defineStore, storeToRefs } from "pinia";
import { computed, ref } from "vue";

import { isValidCurrency } from "../helpers/currencyOfCountry";
import { getUserAgentPlatform, type IPlatformState } from "../helpers/userAgentPlatform";
import { CurrencyData } from "../models/cashbox";
import type { EnumContextFields, EnumFormFields, IPlayerFieldsInfo } from "../models/common";
import type { IStagByReferName } from "../models/configs";
import { Currencies } from "../models/enums/currencies";
import type { MainWidgetItem } from "../models/mainWidget";
import type { ICurrentIP } from "../services/api/DTO/current-ip";
import type { ICountries, ICryptoExchangeRates, ICurrencies, IProjectInfo } from "../services/api/DTO/info";
import { useConfigStore } from "./configStore";
import { useMultilangStore } from "./multilang";

export interface ICommonStoreDefaultOptions {
    defaultCurrency: string;
    enableCurrencies: string[];
}

export const useCommon = defineStore("common", () => {
    const { $defaultProjectConfig } = useConfigStore();

    const platform = ref<IPlatformState>();
    const currentIpInfo = ref<ICurrentIP>();
    const currencies = ref<ICurrencies[]>([]);
    const playerFieldsInfo = ref<IPlayerFieldsInfo>();
    const excludedPromoStags = ref<string[]>([]);
    const currencyConfig = ref<null | CurrencyData>(null);
    const widgetsConfig = ref<MainWidgetItem[]>([]);
    const stagsByReferName = ref<IStagByReferName>();
    const countries = ref<ICountries[]>([]);
    const infoProject = ref<IProjectInfo>();
    const cryptoExchangeRates = ref<ICryptoExchangeRates>();

    if (typeof window !== "undefined") {
        getUserAgentPlatform().then((platformData) => {
            platform.value = platformData;
        });
    }

    const defaultCurrency = ref($defaultProjectConfig.currencyDefault);
    const enableCurrencies = ref([ ...$defaultProjectConfig.ENABLE_CURRENCIES ]);

    const isMobile = computed<boolean | undefined>(() => {
        return platform.value && platform.value.isMobile;
    });

    function setPlayerFieldsInfo(data: IPlayerFieldsInfo) {
        playerFieldsInfo.value = data;
    }

    function setExcludedPromoStags(data: string[]) {
        excludedPromoStags.value = data;
    }

    function hasFieldsInContext(context: EnumContextFields, field: EnumFormFields) {
        return playerFieldsInfo.value?.contexts[context]?.includes(field);
    }

    function getFieldsType(context: EnumContextFields, field: string) {
        return playerFieldsInfo.value?.fields?.find((fieldItem) => fieldItem.field === field);
    }

    function setStagByReferName(data: IStagByReferName) {
        stagsByReferName.value = data;
    }

    function setCountries(data: ICountries[]) {
        countries.value = data;
    }

    const getCountries = computed(() => {
        const { getUserGeo } = storeToRefs(useMultilangStore());

        const countriesPrepared = [ ...countries.value ];
        if (getUserGeo && countriesPrepared.length > 0) {
            countriesPrepared.unshift(countriesPrepared.splice(countriesPrepared.findIndex(({ code }) => {
                return code === getUserGeo.value;
            }), 1)[0]);
            return countriesPrepared;
        }
        return countriesPrepared;
    });

    const getDefaultCurrency = computed(() => {
        const ipCurrency = currentIpInfo.value?.default_currency;

        return isValidCurrency(ipCurrency) ? ipCurrency : defaultCurrency.value;
    });

    function setCurrentIpInfo(currency: ICurrentIP) {
        currentIpInfo.value = currency;
    }

    function setDefaultOptions(defaultOptions: ICommonStoreDefaultOptions) {
        defaultCurrency.value = defaultOptions.defaultCurrency;
        enableCurrencies.value = [ ...defaultOptions.enableCurrencies ];
    }

    function setCurrencies(data: ICurrencies[]) {
        currencies.value = data;
    }

    const getAllCurrencies = computed<ICurrencies[]>(() => {
        return currencies.value;
    });

    const isCryptoCurrency = (currency: Currencies): boolean => {
        return Boolean(currencies.value.length) && !currencies.value.find(({ code }) => code === currency)?.fiat;
    };

    const getCurrencyFiat = computed(() => {
        return currencies.value.filter(({ fiat }) => fiat).map(({ code }) => code);
    });

    const getCurrencyCrypto = computed(() => {
        return currencies.value.filter(({ fiat }) => !fiat).map(({ code }) => code);
    });

    function setCryptoExchangeRates(data: ICryptoExchangeRates) {
        cryptoExchangeRates.value = data;
    }

    function setCurrencyConfig(data: CurrencyData) {
        currencyConfig.value = data;
    }

    function setMainWidgetConfig(data: MainWidgetItem[]) {
        widgetsConfig.value = data;
    }

    function setProjectInfo(data: IProjectInfo) {
        infoProject.value = data;
    }

    return {
        isMobile,

        setDefaultOptions,
        playerFieldsInfo,
        setPlayerFieldsInfo,

        hasFieldsInContext,
        getFieldsType,

        stagsByReferName,
        setStagByReferName,
        currentIpInfo,

        countries,
        setCountries,
        getCountries,

        setCurrentIpInfo,
        currencies,
        setCurrencies,
        enableCurrencies,
        getAllCurrencies,
        isCryptoCurrency,
        getCurrencyFiat,
        getCurrencyCrypto,
        getDefaultCurrency,

        setProjectInfo,
        infoProject,

        cryptoExchangeRates,
        setCryptoExchangeRates,

        excludedPromoStags,
        setExcludedPromoStags,

        currencyConfig,
        setCurrencyConfig,

        widgetsConfig,
        setMainWidgetConfig,
    };
});
