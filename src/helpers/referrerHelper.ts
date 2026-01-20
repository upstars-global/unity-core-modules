import { CookieController } from "../controllers/CookieController";
import { isServer } from "../helpers/ssrHelpers";
import { useConfigStore } from "../store/configStore";

export const referrerHelper = (): string | undefined => {
    if (isServer) {
        return;
    }
    const { $defaultProjectConfig } = useConfigStore();

    return document.referrer || CookieController.get($defaultProjectConfig.REFERRER_COOKIE_NAME);
};
