import { LOCALES } from "@theme/configs/constsLocales";

export function getBaseUrl(url: string): string {
    const localeFromURL = String(url).split("/")[1];

    return Object.values(LOCALES).includes(localeFromURL) && `/${ localeFromURL }` || "/";
}
