import { useConfigStore } from "../store/configStore";

interface IAllDomainsHrefLangs {
    rel: string;
    hreflang: string;
    href: string;
}

export function metaHrefLangsLink(routePath: string): IAllDomainsHrefLangs[] {
    const { $defaultProjectConfig } = useConfigStore();
    const { AVAILABLE_LOCALES, MAIN_LOCALES_AND_DOMAINS } = $defaultProjectConfig;
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
