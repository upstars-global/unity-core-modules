const supportPopup = defineAsyncComponent(() => {
    return import("@modules/Popups/SupportPopup/SupportPopup.vue");
});

import Modal from "@plugins/Modal";
import { computed, defineAsyncComponent } from "vue";

import { updateAuthDetailsProviders } from "../services/user";
import { useMultilangStore } from "../store/multilang";
import { useUserInfo } from "../store/user/userInfo";

export function useUserTermsAcceptingPopup() {
    const userInfoStore = useUserInfo();
    const multilangStore = useMultilangStore();


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
            acceptTerms();
            return;
        }

        showAcceptTermsPopup();
    }

    function acceptTerms() {
        const country = multilangStore.getUserGeo;

        return updateAuthDetailsProviders({
            user: {
                terms_acceptance: true,
                ...(isUserCountryFieldMissing.value ? { country } : {}),
            },
        });
    }

    function showAcceptTermsPopup() {
        Modal.show({
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
