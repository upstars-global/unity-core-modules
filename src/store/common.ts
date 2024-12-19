import { defineStore, type Pinia, storeToRefs } from "pinia";
import { computed, ref } from "vue";

import log from "../controllers/Logger";
import { currencyOfCountry } from "../helpers/currencyOfCountry";
import { getUserAgentPlatform, type IPlatformState } from "../helpers/userAgentPlatform";
import type { IStagByReferName, ISurveyConfig } from "../models/configs";
import { Currencies } from "../models/enums/currencies";
import type { ICountries, ICryptoExchangeRates, ICurrencies, IProjectInfo } from "../services/api/DTO/info";
import { http } from "../services/api/http";
import { loadStagByReferNameReq, loadSurveyConfigReq } from "../services/api/requests/configs";
import {
    loadCountriesReq,
    loadCryptoExchangeRatesReq,
    loadCurrenciesReq,
    loadProjectInfoReq,
} from "../services/api/requests/info";
import type { IPlayerFieldsInfo } from "../types/common";
import { useMultilangStore } from "./multilang";

export interface ICommonStoreDefaultOptions {
    defaultCurrency: string;
    enableCurrencies: string[];
}

export const useCommon = defineStore("common", () => {
    const platform = ref<IPlatformState>();
    const defaultCurrency = ref("EUR");
    const currencies = ref<ICurrencies[]>([]);
    const enableCurrencies = ref<Set<string>>(new Set());

    if (typeof window !== "undefined") {
        getUserAgentPlatform().then((platformData) => {
            platform.value = platformData;
        });
    }

    const isMobile = computed<boolean | undefined>(() => {
        return platform.value && platform.value.isMobile;
    });

    const playerFieldsInfo = ref<IPlayerFieldsInfo>();

    async function loadPlayerFieldsInfo({ reload } = { reload: false }): Promise<IPlayerFieldsInfo> {
        if (playerFieldsInfo.value && !reload) {
            return playerFieldsInfo.value;
        }
        try {
            const { data } = await http().get("/api/info/player_fields");
            playerFieldsInfo.value = data;

            return data;
        } catch (err) {
            log.error("LOAD_PLAYER_FIELDS_INFO", err);
            throw err;
        }
    }

    // @ts-expect-error Parameters implicitly have an 'any' type.
    function hasFieldsInContext(context, field) {
        // @ts-expect-error Element implicitly has an 'any' type
        return playerFieldsInfo.value?.contexts[context]?.includes(field);
    }

    // @ts-expect-error Parameters implicitly have an 'any' type.
    function getFieldsType(context, field) {
        return playerFieldsInfo.value?.fields?.find((fieldItem) => fieldItem.field === field);
    }

    const stagsByReferName = ref<IStagByReferName>();

    async function loadStagByReferName() {
        if (stagsByReferName.value) {
            return stagsByReferName.value;
        }

        const data = await loadStagByReferNameReq();
        stagsByReferName.value = data;
        return data;
    }

    const surveyConfig = ref<ISurveyConfig>();

    async function loadSurveyConfig() {
        const data = await loadSurveyConfigReq();
        surveyConfig.value = data;
        return data;
    }

    const countries = ref<ICountries[]>([]);

    async function loadCountries({ reload } = { reload: false }) {
        if (!reload && countries.value.length) {
            return countries.value;
        }

        const data = await loadCountriesReq();
        if (data) {
            countries.value = data;
        }
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
        const { getUserGeo: codeByGeoIp } = storeToRefs(useMultilangStore());
        const defaultCurrencyOfCountry = currencyOfCountry(codeByGeoIp.value) as string;
        return defaultCurrencyOfCountry || defaultCurrency.value;
    });

    function setDefaultOptions(defaultOptions: ICommonStoreDefaultOptions) {
        defaultCurrency.value = defaultOptions.defaultCurrency;
        enableCurrencies.value = new Set(defaultOptions.enableCurrencies);
    }

    async function loadCurrencies() {
        const data = await loadCurrenciesReq();
        if (data) {
            currencies.value = data.filter(({ code }) => enableCurrencies.value.has(code));
        }
    }

    const getAllCurrencies = computed<ICurrencies[]>(() => {
        return currencies.value;
    });

    const isCryptoCurrency = (currency: Currencies): boolean => {
        return !currencies.value.find(({ code }) => code === currency)?.fiat;
    };

    const getCurrencyFiat = computed(() => {
        return currencies.value.filter(({ fiat }) => fiat).map(({ code }) => code);
    });

    const getCurrencyCrypto = computed(() => {
        return currencies.value.filter(({ fiat }) => !fiat).map(({ code }) => code);
    });

    const infoProject = ref<IProjectInfo>();

    async function loadProjectInfo(): Promise<void> {
        infoProject.value = await loadProjectInfoReq();
    }

    const cryptoExchangeRates = ref<ICryptoExchangeRates>();

    async function loadCryptoExchangeRates(): Promise<void> {
        cryptoExchangeRates.value = await loadCryptoExchangeRatesReq();
    }

    return {
        isMobile,

        setDefaultOptions,
        loadPlayerFieldsInfo,
        playerFieldsInfo,

        hasFieldsInContext,
        getFieldsType,

        stagsByReferName,
        loadStagByReferName,

        surveyConfig,
        loadSurveyConfig,

        loadCountries,
        getCountries,

        loadCurrencies,
        currencies,
        enableCurrencies,
        getAllCurrencies,
        isCryptoCurrency,
        getCurrencyFiat,
        getCurrencyCrypto,
        getDefaultCurrency,

        loadProjectInfo,
        infoProject,

        cryptoExchangeRates,
        loadCryptoExchangeRates,
    };
});

export function useCommonFetchService(defaultOptions: ICommonStoreDefaultOptions, pinia?: Pinia) {
    const {
        setDefaultOptions,
        loadCountries,
        loadCurrencies,
        loadProjectInfo,
        loadCryptoExchangeRates,
    } = useCommon(pinia);

    setDefaultOptions(defaultOptions);

    return {
        loadCountries,
        loadCurrencies,
        loadProjectInfo,
        loadCryptoExchangeRates,
    };
}
