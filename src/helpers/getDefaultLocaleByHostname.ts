import {
    COUNTRY_BY_HOST,
    DEFAULT_COUNTRY,
    DEFAULT_LOCALE_BY_COUNTRY,
// @ts-expect-error -- TS2307: Cannot find module '@theme/configs/constsLocales' or its corresponding type declarations.
} from "@theme/configs/constsLocales";

export function getDefaultLocaleByHostname(): string {
    const hostname = typeof window === "undefined" ? "" : window.location.hostname;
    const countryByHost = COUNTRY_BY_HOST[hostname] || DEFAULT_COUNTRY;

    return DEFAULT_LOCALE_BY_COUNTRY[countryByHost] || DEFAULT_LOCALE_BY_COUNTRY.default;
}
