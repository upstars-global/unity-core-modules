import { MAIN_LOCALES_AND_DOMAINS } from "@theme/configs/constsLocales";

interface ICanonical {
    rel: string;
    href: string;
}

export function canonicalHelper(locale: string, pathname: string): ICanonical | void {
    const computedHostname = MAIN_LOCALES_AND_DOMAINS[locale];

    if (computedHostname) {
        return { rel: "canonical", href: `https://${computedHostname}${pathname}` };
    }
}
