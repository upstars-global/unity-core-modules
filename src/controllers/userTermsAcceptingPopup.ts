const supportPopup = defineAsyncComponent(() => {
    return import("@modules/Popups/SupportPopup/SupportPopup.vue");
});

import { computed, defineAsyncComponent } from "vue";

import { updateAuthDetailsProviders } from "../services/user";
import { useMultilangStore } from "../store/multilang";
import { useUIStore } from "../store/ui";
import { useUserInfo } from "../store/user/userInfo";

interface IUserTermsAcceptingPopupOptions {
    getAcceptTermsExtraFields?: () => Record<string, unknown>;
    onTermsAccepted?: () => Promise<unknown> | unknown;
}

export function useUserTermsAcceptingPopup(options: IUserTermsAcceptingPopupOptions = {}) {
    const userInfoStore = useUserInfo();
    const multilangStore = useMultilangStore();
    const uiStore = useUIStore();

    const isUserTermsAccepted = computed(() => {
        return userInfoStore.getUserInfo.auth_fields_missed?.includes("terms_acceptance");
    }); // can be renamed after refactoring king

    const isUserTermsNotAccepted = isUserTermsAccepted; // for naming consistency

    const isUserCountryFieldMissing = computed(() => {
        return userInfoStore.getUserInfo.auth_fields_missed?.includes("country");
    });

    function runShowingTermsPopup(autoAccept: boolean = false) {
        if (!isUserTermsNotAccepted.value) {
            return;
        }

        if (autoAccept) {
            return acceptTerms();
        }

        showAcceptTermsPopup();
    }

    async function acceptTerms() {
        const country = multilangStore.getUserGeo;
        const extraFields = options.getAcceptTermsExtraFields?.() || {};

        const response = await updateAuthDetailsProviders({
            user: {
                terms_acceptance: true,
                ...(isUserCountryFieldMissing.value ? { country } : {}),
                ...extraFields,
            },
        });

        if (response?.status === 201) {
            await options.onTermsAccepted?.();
        }

        return response;
    }

    function showAcceptTermsPopup() {
        uiStore.setShowModal({
            name: "modal-support",
            component: supportPopup,
            mobileFriendly: true,
            blockCloseOverlay: true,
            fullScreenMobile: true,
            props: {
                acceptHandler: acceptTerms,
            },
        });
    }

    return {
        isUserTermsNotAccepted, // for naming consistency
        isUserTermsAccepted, // can be removed after refactoring king
        runShowingTermsPopup,
        showAcceptTermsPopup,
        acceptTerms,
    };
}
