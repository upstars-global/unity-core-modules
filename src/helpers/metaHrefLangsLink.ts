import {
    AVAILABLE_LOCALES,
    MAIN_LOCALES_AND_DOMAINS,
} from "@theme/configs/constsLocales";

interface IAllDomainsHrefLangs {
    rel: string;
    hreflang: string;
    href: string;
}

export function metaHrefLangsLink(routePath: string): IAllDomainsHrefLangs[] {
    const allDomainsHrefLangs: IAllDomainsHrefLangs[] = [];

    Object.keys(MAIN_LOCALES_AND_DOMAINS).forEach((locale) => {
        if (AVAILABLE_LOCALES[locale] === true) {
            allDomainsHrefLangs.push({
                rel: "alternate",
                hreflang: locale,
                href: `https://${ MAIN_LOCALES_AND_DOMAINS[locale] }${ routePath }`,
            });
        }
    });

    return allDomainsHrefLangs;
}
