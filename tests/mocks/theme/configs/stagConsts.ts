const COUNTRIES = {
    CANADA: "CA",
};

export const STAG_KEY = "stag";
export const STAG_PARTNER_KEY = "partner-stag";
export const AFFB_ID_KEY = "affb_id";
export const AFFB_ID_DEFAULT = 111;

export enum REFERRER {
    GOOGLE = "google",
    BING = "bing",
    YAHOO = "yahoo",
}

export const REFERRER_NAME = {
    google: REFERRER.GOOGLE,
    bing: REFERRER.BING,
    yahoo: REFERRER.YAHOO,
};

export const DEFAULT_STAGS_COUNTRY_REFER: Record<string, Record<REFERRER, string>> = {
    [COUNTRIES.CANADA]: {
        [REFERRER.GOOGLE]: "111111",
        [REFERRER.BING]: "111111",
        [REFERRER.YAHOO]: "111111",
    },
};

export const WELCOME_PACK_STAG_ID: Record<string, boolean> = {
    111: true,
} as const;
