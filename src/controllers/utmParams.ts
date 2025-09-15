import { CookieController } from "./CookieController";

export const UTM_PARAMS = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "sub_id",
];

export function getUtmParamsFromCookies() {
    const utmParams = {} as Record<string, string | undefined>;

    UTM_PARAMS.forEach((key) => {
        utmParams[key] = CookieController.get(key);
    });

    return utmParams;
}
