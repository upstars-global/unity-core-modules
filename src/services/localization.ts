import {
    AFFB_ID_DEFAULT,
    AFFB_ID_KEY,
    STAG_KEY } from "@theme/configs/stagConsts";
import type { Composer, VueI18n } from "vue-i18n";
import type { LocationQuery } from "vue-router";

import { StagController } from "../controllers/StagController";
import { redirectToLang } from "../helpers/redirectToLang";
import { useMultilangStore } from "../store/multilang";
import type { LocaleName, Locales } from "./api/DTO/multilang";
import { loadLocalesReq, updateLocalesReq } from "./api/requests/multilang";

export async function loadLocales(queryParams: LocationQuery = {}) {
    const { getUserLocale, getDefaultLang, setLocales, setLocale } = useMultilangStore();

    if (getUserLocale) {
        setLocale(getUserLocale);
    }

    const query = new URLSearchParams();

    const { affb_id } = queryParams;
    query.set(AFFB_ID_KEY, String(affb_id || AFFB_ID_DEFAULT));

    const stag = StagController.getStag();
    if (stag) {
        query.set(STAG_KEY, String(stag));
    }

    return loadLocalesReq(query.toString()).then((data: Locales) => {
        setLocales(data);
        if (!getUserLocale) {
            setLocale(getDefaultLang);
        }
    });
}

export async function updateLocale({ lang }: { lang: LocaleName }) {
    const { getDefaultLang, locales } = useMultilangStore();

    return updateLocalesReq({ locale: lang }).then(() => {
        redirectToLang(lang, getDefaultLang, locales);
    });
}

export function changeLocale(i18nInstance: VueI18n | Composer, locale: LocaleName) {
    const multilangStore = useMultilangStore();
    i18nInstance.locale = locale;
    multilangStore.setLocale(locale);
}
