import {
    AVAILABLE_LOCALES,
    DOMAIN_FOR_AUSTRALIA,
    MAIN_LOCALES_AND_DOMAINS,
} from "@theme/configs/constsLocales";

interface IAllDomainsHrefLangs {
    rel: string;
    hreflang: string;
    href: string;
}

export function metaHrefLangsLink(routePath: string): IAllDomainsHrefLangs[] {
    const allDomainsHrefLangs: IAllDomainsHrefLangs[] = [
        {
            rel: "alternate",
            hreflang: "x-default",
            href: `https://${ DOMAIN_FOR_AUSTRALIA }${ routePath }`,
        },
    ];

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
