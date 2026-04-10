import { AVAILABLE_LOCALES } from "@theme/configs/constsLocales";
import { AFFB_ID_KEY, STAG_PARTNER_KEY } from "@theme/configs/stagConsts";
import type { Composer, VueI18n } from "vue-i18n";

import { StagController } from "../controllers/StagController";
import { redirectToLang } from "../helpers/redirectToLang";
import { getUrlSearchParams } from "../helpers/urlHelpers";
import { useConfigStore } from "../store/configStore";
import { useMultilangStore } from "../store/multilang";
import type { LocaleName, Locales } from "./api/DTO/multilang";
import { loadLocalesReq, updateLocalesReq } from "./api/requests/multilang";

function getRequestQueryParams() {
    const requestQueryParams = new URLSearchParams();
    const urlSearchParams = getUrlSearchParams();
    const ref_code = urlSearchParams?.get("ref_code");
    const affb_id = StagController.getAffbId();

    if (ref_code) {
        requestQueryParams.set("ref_code", ref_code);

        const stag = StagController.getStag();
        const stagHold = StagController.getStagHold();
        const { $defaultProjectConfig } = useConfigStore();
        const referralStag = $defaultProjectConfig?.referralStag;

        if ((!stag || !stagHold) && referralStag) {
            StagController.setStag(referralStag);
        }
    }

    if (affb_id) {
        requestQueryParams.set(AFFB_ID_KEY, affb_id);
    }

    const actualStag = StagController.getStag();

    if (actualStag) {
        requestQueryParams.set(STAG_PARTNER_KEY, actualStag);
    }

    return requestQueryParams;
}

export async function loadLocales() {
    const { getUserLocale, getDefaultLang, setLocales, setLocale } = useMultilangStore();

    if (getUserLocale) {
        setLocale(getUserLocale);
    }

    const query = getRequestQueryParams();

    return loadLocalesReq(query.toString()).then((data: Locales) => {
        const localesComputed = data.filter((item) => AVAILABLE_LOCALES[item.code] === true);

        setLocales(localesComputed);
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
