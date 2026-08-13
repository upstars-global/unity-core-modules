// @ts-expect-error -- TS2307: Cannot find module '@theme/configs/constsLocales' or its corresponding type declarations.
import { LOCALES } from "@theme/configs/constsLocales";

export function getBaseUrl(url: string): string {
    const localeFromURL = String(url).split("/")[1];
    return Object.values(LOCALES).includes(localeFromURL) && `/${ localeFromURL }/` || "/";
}

export function replaceBaseUrl(path: string): string {
    const localeFromURL = String(path).split("/")[1];
    const regexp = new RegExp("/" + localeFromURL + "/?");
    return Object.values(LOCALES).includes(localeFromURL) ? path.replace(regexp, "/") : path;
}