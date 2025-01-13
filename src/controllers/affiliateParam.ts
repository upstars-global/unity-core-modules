import { CookieController } from "./CookieController";

export function setAffiliateToCookie(query = {}, expires) {
    if (typeof document === "undefined") {
        return;
    }
    const affiliatePattern = /p(\d+)p(\d+)p([\w]{4})(?:t(\d+))?(?:f(\d+))?(?:l(\d+))?([a-z\d]+)?/;
    let cookieValue = "";
    const now = new Date();
    now.setTime(now.getTime() + expires);

    Object.keys(query).find((key) => {
        if (key.match(affiliatePattern)) {
            cookieValue = key;
        }
    });

    CookieController.set("affiliate", cookieValue, {
        "expires": now.toGMTString(),
        "path=/": true,
    });
}

export function getAffiliateToCookie() {
    return CookieController.get("affiliate");
}
