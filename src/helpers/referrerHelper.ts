import { REFERRER_COOKIE_NAME } from "@theme/configs/constsCookies";

import { CookieController } from "../controllers/CookieController";
import { isServer } from "../helpers/ssrHelpers";

export const referrerHelper = (): string | undefined => {
    if (isServer) {
        return;
    }

    return document.referrer || CookieController.get(REFERRER_COOKIE_NAME);
};
