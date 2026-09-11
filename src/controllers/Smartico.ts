import { isServer } from "../helpers/ssrHelpers";

const smarticoPopupSuspenders = new Set<string>();

export function useSmartico() {
    function setSmarticoUser(userId: string, language: string) {
        if (!isServer) {
            window._smartico_user_id = userId;
            window._smartico_language = language;

            window._smartico?.changeLanguage(language);
        }
    }

    function clearSmarticoUser() {
        if (!isServer) {
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
        const smartico = isServer ? undefined : window._smartico;

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
        const smartico = isServer ? undefined : window._smartico;

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
        removeSmarticoIdentifyListener,
        setSmarticoPopupsSuspendedBy,
        suspendSmarticoInbox,
        suspendSmarticoPopups,
        updateSmarticoUser,
    };
}
