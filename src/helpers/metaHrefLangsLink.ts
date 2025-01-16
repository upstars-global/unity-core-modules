import {
    DOMAIN_FOR_AUSTRALIA,
    DOMAIN_FOR_CANADA,
    DOMAIN_FOR_ITALY,
    LOCALES,
    MAIN_LOCALES_AND_DOMAINS,
} from "@theme/configs/constsLocales";

interface IAllDomainsHrefLangs {
    rel: string;
    hreflang: string;
    href: string;
}

export function metaHrefLangsLink(locale: string, pathname: string): IAllDomainsHrefLangs[] {
    const allDomainsHrefLangs: IAllDomainsHrefLangs[] = [];

    const hrefLangsMap: { [key: string]: { hreflang: string; href: string }[] } = {
        [DOMAIN_FOR_CANADA]: [
            { hreflang: LOCALES.CANADIAN_ENGLISH, href: MAIN_LOCALES_AND_DOMAINS[LOCALES.CANADIAN_ENGLISH] },
            { hreflang: LOCALES.NEW_ZEALAND, href: MAIN_LOCALES_AND_DOMAINS[LOCALES.NEW_ZEALAND] },
            { hreflang: LOCALES.GERMANY, href: MAIN_LOCALES_AND_DOMAINS[LOCALES.GERMANY] },
        ],
        [DOMAIN_FOR_AUSTRALIA]: [
            { hreflang: LOCALES.AUSTRALIAN_ENGLISH, href: MAIN_LOCALES_AND_DOMAINS[LOCALES.AUSTRALIAN_ENGLISH] },
            { hreflang: "x-default", href: MAIN_LOCALES_AND_DOMAINS[LOCALES.AUSTRALIAN_ENGLISH] },
        ],
        [DOMAIN_FOR_ITALY]: [
            { hreflang: LOCALES.ITALIAN, href: MAIN_LOCALES_AND_DOMAINS[LOCALES.ITALIAN] },
        ],
    };

    const computedHostname = MAIN_LOCALES_AND_DOMAINS[locale]?.replace(`/${locale}`, "");
    const computedHrefLangs = hrefLangsMap[computedHostname];

    if (computedHrefLangs) {
        allDomainsHrefLangs.push(...computedHrefLangs.map((item) => {
            return {
                rel: "alternate",
                hreflang: item.hreflang,
                href: `https://${item.href}${pathname}`,
            };
        }));
    }

    return allDomainsHrefLangs;
}
