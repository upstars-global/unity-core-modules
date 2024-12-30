const supportPopup = defineAsyncComponent(() => {
    return import("@modules/Popups/SupportPopup/SupportPopup.vue");
});

function showAcceptTermsPopup() {
    Modal.show({
        name: "modal-support",
        component: supportPopup,
        mobileFriendly: true,
        blockCloseOverlay: true,
    });
}

import Modal from "@plugins/Modal";
import { computed, defineAsyncComponent } from "vue";

import { useUserInfo } from "../store/user/userInfo";

export function useUserTermsAcceptingPopup() {
    const userStore = useUserInfo();

    const isUserTermsAccepted = computed(() => {
        const userData = userStore.getUserInfo;
        return userData.auth_fields_missed?.includes("terms_acceptance");
    });

    function runShowingTermsPopup() {
        if (isUserTermsAccepted.value) {
            return showAcceptTermsPopup();
        }
    }

    return {
        isUserTermsAccepted,
        runShowingTermsPopup,
    };
}
