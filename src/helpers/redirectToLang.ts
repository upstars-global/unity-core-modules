import { type Locales } from "../services/api/DTO/multilang";
import { inIframe } from "./iframeHelpers";

export function redirectToLang(lang: string, defaultLang: string, enableLocales: Locales) {
    if (typeof window === "undefined" || inIframe()) {
        return;
    }
    const originalUrl = window.location.pathname + window.location.search;
    const urlLang = originalUrl.split("/")[1];
    if (lang === urlLang) {
        return;
    }
    const urlLangInEnableLocale = enableLocales?.find((item) => {
        return item.code === urlLang;
    });
    if (urlLangInEnableLocale) {
        if (lang === defaultLang) {
            window.location.href = originalUrl.replace(/\/[a-z]{2}-?[A-Z]{0,2}\/?/, "/");
        } else {
            window.location.href = originalUrl.replace(urlLang, lang);
        }
    } else if (lang !== defaultLang) {
        window.location.href = `/${ lang }${ originalUrl }`;
    }
}
