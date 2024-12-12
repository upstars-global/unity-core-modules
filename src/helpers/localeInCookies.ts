import { Buffer } from "buffer";

import { CookieController } from "../controllers/CookieController";

const KEY_LOCALE = "locale";

export function getLocale() {
    const localeInCookie = CookieController.get(KEY_LOCALE)?.split("==")[0];
    if (localeInCookie) {
        return Buffer.from(localeInCookie, "base64").toString("ascii").replace(/\"/g, "");
    }
    return;
}
