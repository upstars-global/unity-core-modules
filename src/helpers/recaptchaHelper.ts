import { storeToRefs } from "pinia";
import { load } from "recaptcha-v3";

import { useUserInfo } from "../store/user/userInfo";
import { reportAuthTechnicalError } from "./authTelemetry";

export async function generateCaptcha(recaptchaAction: string) {
    const action = recaptchaAction.toLowerCase();
    const flow = action === "login" || action === "registration" ? action : undefined;
    const { getSettings } = storeToRefs(useUserInfo());

    for (let attempt = 0; attempt < 5; attempt++) {
        const recaptchaKey = getSettings.value?.recaptcha;
        if (recaptchaKey) {
            try {
                const recaptcha = await load(recaptchaKey, {
                    autoHideBadge: true,
                });
                return await recaptcha.execute(recaptchaAction);
            } catch {
                if (flow) {
                    reportAuthTechnicalError({ flow, step: "captcha", reason: "sdk_error" });
                } else {
                    console.error("Error in generateCaptcha");
                }
                return;
            }
        }

        if (attempt < 4) {
            await new Promise((resolve) => setTimeout(resolve, 500));
        }
    }

    if (flow) {
        reportAuthTechnicalError({ flow, step: "captcha", reason: "settings_timeout" });
    }
}
