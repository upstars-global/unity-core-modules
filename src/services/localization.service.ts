// TODO: remove magic imports
import stagController from "@controllers/StagController";
import { AFFB_ID_KEY, STAG_KEY } from "@theme/configs/stagConsts";
import type { Composer, VueI18n } from "vue-i18n";

import { redirectToLang } from "../helpers/redirectToLang";
import { useMultilangStore } from "../store/multilang";
import type { LocaleName, Locales } from "./api/DTO/multilang";
import { loadLocalesReq, updateLocalesReq } from "./api/requests/multilang";

export async function loadLocales() {
    const { getUserLocale, getDefaultLang, setLocales, setLocale } = useMultilangStore();

    if (getUserLocale.value) {
        setLocale(getUserLocale.value);
    }

    const query = new URLSearchParams();

    const affb_id = stagController.getAffbId();
    if (affb_id) {
        query.set(AFFB_ID_KEY, affb_id);
    }

    const stag = stagController.getStag();
    if (stag) {
        query.set(STAG_KEY, stag);
    }

    return loadLocalesReq(query.toString()).then((data: Locales) => {
        setLocales(data);
        if (!getUserLocale.value) {
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
