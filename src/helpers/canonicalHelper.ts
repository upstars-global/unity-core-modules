import { MAIN_LOCALES_AND_DOMAINS } from "@theme/configs/constsLocales";

interface ICanonical {
    rel: string;
    href: string;
}

export function canonicalHelper(locale: string, pathname: string): ICanonical | void {
    const computedHostname = MAIN_LOCALES_AND_DOMAINS[locale];
    // Временный сео функционал https://upstars.atlassian.net/browse/UN-702
    const computedPathname = pathname.startsWith("/categories/") ? `/pokies/${pathname.replace("/categories/", "")}` : pathname;

    if (computedHostname) {
        return { rel: "canonical", href: `https://${computedHostname}${computedPathname}` };
    }
}
