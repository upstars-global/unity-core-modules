import { defineStore, type Pinia } from "pinia";
import { computed, ref } from "vue";

import { getLocale } from "../helpers/localeInCookies";
import type { LocaleName, Locales } from "../services/api/DTO/multilang";

export interface IDefaultLocaleByCountry {
    [key: string]: string;
    default: string;
}

export interface IMultilangDefaultParams {
    defaultCountry: string;
    defaultLocaleByCountry: IDefaultLocaleByCountry;
}

export const useMultilangStore = defineStore("multilang", () => {
    const locales = ref<Locales>([]);
    const locale = ref<LocaleName>("");
    const geo = ref("");
    const country = ref("");
    const defaultCountry = ref("");
    const defaultLocaleByCountry = ref({ default: "en" } as IDefaultLocaleByCountry);

    const getDefaultLang = computed(() => {
        const {
            [country.value]: mainLocale,
            default: defaultLocale,
        } = defaultLocaleByCountry.value;

        return mainLocale || defaultLocale;
    });

    const getUserLocale = computed(() => {
        return getLocale() || locale.value || getDefaultLang.value;
    });

    const getUserGeo = computed(() => {
        return geo.value || defaultCountry.value;
    });

    function setDefaultParams(data: IMultilangDefaultParams) {
        defaultCountry.value = data.defaultCountry;
        defaultLocaleByCountry.value = data.defaultLocaleByCountry;
    }

    function setLocale(localeName: LocaleName) {
        locale.value = localeName;
    }

    function setLocales(data: Locales) {
        locales.value = data;
    }

    return {
        locales,
        geo,
        locale,
        country,

        getDefaultLang,
        getUserLocale,
        getUserGeo,
        setDefaultParams,
        setLocale,
        setLocales,
    };
});

export function useMultilangFetchService({ defaultCountry, defaultLocaleByCountry }: IMultilangDefaultParams, pinia?: Pinia) {
    const multilangStore = useMultilangStore(pinia);
    multilangStore.setDefaultParams({ defaultCountry, defaultLocaleByCountry });

    function loadMultilang() {
        return Promise.resolve();
    }

    return {
        loadMultilang,
    };
}
