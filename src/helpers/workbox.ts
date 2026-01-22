import { useConfigStore } from "../store/configStore";

function getLocaleConfig() {
    const { $defaultProjectConfig } = useConfigStore();
    return $defaultProjectConfig;
}

function getPathLocale(pathname: string): string | null {
    const { LOCALES } = getLocaleConfig();
    const [ , lang ] = pathname.split("/");

    return Object.values(LOCALES).includes(lang) ? lang : null;
}

interface IResConfig {
    status: 200 | 301 | 302;
    url: string;
}
export function localeHostname(url: URL, savedLoc: string): IResConfig {
    const {
        COUNTRY_BY_HOST,
        DEFAULT_COUNTRY,
        DEFAULT_LOCALE_BY_COUNTRY,
    } = getLocaleConfig();
    const pathLoc = getPathLocale(url.pathname);
    const country = COUNTRY_BY_HOST[url.hostname] || DEFAULT_COUNTRY;
    const hostLoc = DEFAULT_LOCALE_BY_COUNTRY[country];
    const reqLoc = pathLoc || hostLoc;

    if (savedLoc === hostLoc && hostLoc === pathLoc) {
        return {
            status: 301,
            url: url.pathname.replace(`/${pathLoc}`, ""),
        };
    }

    if (savedLoc === reqLoc) {
        return {
            status: 200,
            url: "",
        };
    }

    if (savedLoc === hostLoc) {
        return {
            status: 302,
            url: url.pathname.replace(`/${pathLoc}`, ""),
        };
    }

    if (pathLoc) {
        return {
            status: 302,
            url: url.pathname.replace(pathLoc, savedLoc),
        };
    }

    if (url.pathname === "/") {
        return {
            status: 302,
            url: `/${savedLoc}`,
        };
    }

    return {
        status: 302,
        url: `/${savedLoc}${url.pathname}`,
    };
}

export function getResponseConfig(url: URL, savedLoc: string): IResConfig {
    const config = localeHostname(url, savedLoc);

    return {
        status: config.status,
        url: `${ url.origin }${ config.url }${ url.search }`,
    };
}
