import {
    COUNTRY_BY_HOST,
    DEFAULT_LOCALE_BY_COUNTRY,
// @ts-expect-error -- TS2307: Cannot find module '@theme/configs/constsLocales' or its corresponding type declarations.
} from "@theme/configs/constsLocales";

export function getDefaultLocaleByHostname(): string {
    const countryByHost = COUNTRY_BY_HOST[window?.location?.hostname];

    return DEFAULT_LOCALE_BY_COUNTRY[countryByHost] || DEFAULT_LOCALE_BY_COUNTRY.default;
}
