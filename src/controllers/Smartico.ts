import { onMounted, onScopeDispose, ref, watch } from "vue";

import { isServer } from "../helpers/ssrHelpers";
import { log } from "./Logger";

const smarticoPopupSuspenders = new Set<string>();

export function getSmartico() {
    return isServer ? undefined : window._smartico;
}

export function useSmartico() {
    function setSmarticoUser(userId: string, language: string) {
        if (!isServer) {
            if (window._smartico_user_id !== userId) {
                smarticoIdentified.value = false;
            }
            window._smartico_user_id = userId;
            window._smartico_language = language;

            window._smartico?.changeLanguage(language);
        }
    }

    function clearSmarticoUser() {
        if (!isServer) {
            smarticoIdentified.value = false;
            window._smartico_user_id = null;
            window._smartico_language = null;
        }
    }

    function updateSmarticoUser(userId?: string, userLanguage?: string) {
        if (userId && userLanguage) {
            setSmarticoUser(userId, userLanguage);
        } else {
            clearSmarticoUser();
        }
    }

    function suspendSmarticoPopups(suspend: boolean) {
        if (!isServer && window._smartico_user_id) {
            window._smartico?.suspendPopups(suspend);
        }
    }

    function suspendSmarticoInbox(suspend: boolean) {
        if (!isServer) {
            window._smartico?.suspendInbox(suspend);
        }
    }

    function executeSmarticoAction(action: string) {
        if (!isServer && action) {
            window._smartico?.dp(action);
        }
    }

    function setSmarticoPopupsSuspendedBy(source: string, suspend: boolean) {
        if (suspend) {
            smarticoPopupSuspenders.add(source);
        } else {
            smarticoPopupSuspenders.delete(source);
        }

        suspendSmarticoPopups(smarticoPopupSuspenders.size > 0);
    }

    function addSmarticoIdentifyListener(callback: (errCode: number) => void) {
        const smartico = getSmartico();

        if (smartico?.on) {
            smartico.on("identify", callback);
        } else {
            const smarticoQueue: unknown = smartico;

            if (typeof smarticoQueue === "function") {
                smarticoQueue("on", "identify", callback);
            }
        }
    }

    function removeSmarticoIdentifyListener(callback: (errCode: number) => void) {
        const smartico = getSmartico();

        if (smartico?.off) {
            smartico.off("identify", callback);
        } else {
            const smarticoQueue: unknown = smartico;

            if (typeof smarticoQueue === "function") {
                smarticoQueue("off", "identify", callback);
            }
        }
    }

    return {
        addSmarticoIdentifyListener,
        executeSmarticoAction,
        handleSmarticoIdentify,
        trackSmarticoAction,
        removeSmarticoIdentifyListener,
        setSmarticoPopupsSuspendedBy,
        suspendSmarticoInbox,
        suspendSmarticoPopups,
        updateSmarticoUser,
    };
}

export interface SmarticoAction {
    name: string;
    payload?: Record<string, string | number>;
}

const smarticoIdentified = ref(false);

export function handleSmarticoIdentify(errorCode: number) {
    if (!isServer) {
        smarticoIdentified.value = errorCode === 0 && Boolean(window._smartico_user_id);
    }
}

export function trackSmarticoAction(name: string, payload?: SmarticoAction["payload"]) {
    if (isServer || !smarticoIdentified.value || !window._smartico_user_id) {
        return;
    }
    try {
        getSmartico()?.action(name, payload);
    } catch (error) {
        log.error("SMARTICO_CLIENT_ACTION_ERROR", error);
    }
}

export function useSmarticoView(getAction: () => SmarticoAction | undefined, getViewKey: () => string = () => "") {
    let stop: (() => void) | undefined;
    onMounted(() => {
        stop = watch(
            () => JSON.stringify([ smarticoIdentified.value, getViewKey(), getAction() ]),
            () => {
                const action = getAction();
                if (smarticoIdentified.value && action) {
                    trackSmarticoAction(action.name, action.payload);
                }
            },
            { immediate: true },
        );
    });
    onScopeDispose(() => stop?.());
}
