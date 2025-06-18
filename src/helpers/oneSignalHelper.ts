import { ONESIGNAL_KEY_BY_HOST } from "@config/customerIO";

export function onesignalId() {
    if (typeof window !== "undefined") {
        return ONESIGNAL_KEY_BY_HOST[window.location.hostname];
    }
}

