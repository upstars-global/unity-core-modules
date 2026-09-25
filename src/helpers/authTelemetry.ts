import { log } from "../controllers/Logger";
import { BUS_EVENTS, EventBus } from "../plugins/EventBus";
import { isServer } from "./ssrHelpers";

export type AuthTechnicalError = {
    flow: "login" | "registration";
    step: "password" | "auto_login" | "otp" | "account_creation" | "captcha" | "client";
    reason: "network" | "server" | "unexpected" | "settings_timeout" | "sdk_error";
    status?: number;
};

function logAuthTechnicalError(payload: AuthTechnicalError) {
    try {
        const label = payload.step === "captcha"
            ? "AUTH_CAPTCHA_GENERATION_FAILURE"
            : "AUTH_CLIENT_REQUEST_FAILURE";
        const message = payload.step === "captcha"
            ? `${ payload.flow }:${ payload.reason }`
            : `${ payload.flow }:${ payload.step }:${ payload.reason }`;
        log.error(label, { message });
    } catch {
        return;
    }
}

export function reportAuthTechnicalError(payload: AuthTechnicalError) {
    if (payload.status === undefined) {
        logAuthTechnicalError(payload);
    }

    if (!isServer) {
        try {
            EventBus.$emit(BUS_EVENTS.AUTH_TECHNICAL_ERROR, payload);
        } catch {
            return;
        }
    }
}
