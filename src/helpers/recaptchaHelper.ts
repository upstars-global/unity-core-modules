import { storeToRefs } from "pinia";
import { load } from "recaptcha-v3";

import { useUserInfo } from "../store/user/userInfo";

export async function generateCaptcha(recaptchaAction) {
    const { getSettings } = storeToRefs(useUserInfo());
    if (!getSettings.value?.recaptcha) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return generateCaptcha(recaptchaAction);
    }
    try {
        const recaptcha = await load(getSettings.value.recaptcha, {
            autoHideBadge: true,
        });
        return await recaptcha.execute(recaptchaAction);
    } catch (error) {
        /* eslint-disable-next-line no-console */
        console.error("Error in generateCaptcha", JSON.stringify(error));
    }
}
