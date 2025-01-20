interface IStringDictionary {
    [key: string]: string;
}

interface IBooleanDictionary {
    [key: string]: boolean;
}

export const MAIN_SEO_DOMAIN = "example.com";

const LOCALES: IStringDictionary = {
    ENGLISH: "en",
    IRELAND: "en-IE",
};

const COUNTRIES: IStringDictionary = {
    CANADA: "CA",
    GREAT_BRITAIN: "GB",
    UNITED_KINGDOM: "UK",
};

const ALLOW_DOMAINS: string[] = [
    MAIN_SEO_DOMAIN,
];

const REGIONS_BY_COUNTRIES = {};

const COOKIE_BY_LOCALE: IStringDictionary = {
    [LOCALES.ENGLISH]: "ImVuIg==XXX",
    [LOCALES.IRELAND]: "ImVuLUlFIg==XXX",
};

const COUNTRY_BY_HOST: IStringDictionary = {
    [MAIN_SEO_DOMAIN]: COUNTRIES.GREAT_BRITAIN,

    [`local.${ MAIN_SEO_DOMAIN}`]: COUNTRIES.GREAT_BRITAIN,
};

const AVAILABLE_LOCALES: IBooleanDictionary = {
    [LOCALES.ENGLISH]: true,
    [LOCALES.IRELAND]: true,
};

const DEFAULT_LOCALE_BY_COUNTRY: IStringDictionary = {
    default: LOCALES.ENGLISH,
    [COUNTRIES.GREAT_BRITAIN]: LOCALES.ENGLISH,
};

const DEFAULT_COUNTRY = COUNTRIES.GREAT_BRITAIN;

const LOCALES_CLOSED_FOR_BOT = {
    [LOCALES.IRELAND]: true,
};

const EXCEPTION_DOMAIN_LANG_ALLOW = {
    "example.com": [ LOCALES.ENGLISH, LOCALES.IRELAND ], // for production
};

const PATH_WITH_LANG_REDIRECT: IBooleanDictionary = {
    "/registration": true,
};

export {
    ALLOW_DOMAINS,
    AVAILABLE_LOCALES,
    COOKIE_BY_LOCALE,
    COUNTRIES,
    COUNTRY_BY_HOST,
    DEFAULT_COUNTRY,
    DEFAULT_LOCALE_BY_COUNTRY,
    EXCEPTION_DOMAIN_LANG_ALLOW,
    LOCALES,
    LOCALES_CLOSED_FOR_BOT,
    PATH_WITH_LANG_REDIRECT,
    REGIONS_BY_COUNTRIES,
};
