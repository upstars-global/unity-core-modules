import { COUNTRIES } from "@theme/configs/constsLocales";

export const STAG_KEY = "stag";
export const STAG_PARTNER_KEY = "partner-stag";
export const AFFB_ID_KEY = "affb_id";
export const AFFB_ID_DEFAULT = 111;

export enum REFERRER {
    GOOGLE = "google",
    BING = "bing",
    YAHOO = "yahoo",
    AI = "ai",
}

export const REFERRER_NAME = {
    google: REFERRER.GOOGLE,
    bing: REFERRER.BING,
    yahoo: REFERRER.YAHOO,
    ai: REFERRER.AI,
};

export const DEFAULT_STAGS_COUNTRY_REFER: Record<string, Record<REFERRER, string>> = {
    [COUNTRIES.CANADA]: {
        [REFERRER.GOOGLE]: "google_111111",
        [REFERRER.BING]: "bing_111111",
        [REFERRER.YAHOO]: "yahoo_111111",
        [REFERRER.AI]: "ai_111111",
    },
    others: {
        [REFERRER.GOOGLE]: "google_222222",
        [REFERRER.BING]: "bing_222222",
        [REFERRER.YAHOO]: "yahoo_222222",
        [REFERRER.AI]: "ai_222222",
    },
};

export const WELCOME_PACK_STAG_ID: Record<string, boolean> = {
    111: true,
} as const;
