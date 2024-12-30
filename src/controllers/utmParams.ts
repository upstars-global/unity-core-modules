import { CookieController } from "./CookieController";

export const UTM_PARAMS = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "sub_id",
];

export function setUtmParamsToCookies(query: Record<string, string | undefined> = {}, expires: number) {
    if (typeof document === "undefined") {
        return;
    }

    const now = new Date();
    now.setTime(now.getTime() + expires);

    const isSetCookies = Object.keys(query).some((queryItem) => {
        return UTM_PARAMS.find((utm) => {
            return utm === queryItem;
        });
    });

    if (isSetCookies) {
        UTM_PARAMS.forEach((key) => {
            const cookieValue = query[key] || "";
            CookieController.set(key, cookieValue, {
                "expires": now.toUTCString(),
                "path=/": true,
            });
        });
    }
}

export function getUtmParamsFromCookies() {
    const utmParams = {} as Record<string, string | undefined>;
    UTM_PARAMS.forEach((key) => {
        utmParams[key] = CookieController.get(key);
    });

    return utmParams;
}
