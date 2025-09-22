const supportPopup = defineAsyncComponent(() => {
    return import("@modules/Popups/SupportPopup/SupportPopup.vue");
});

import Modal from "@plugins/Modal";
import { computed, defineAsyncComponent } from "vue";

import { useUserInfo } from "../store/user/userInfo";
import { useUserStatuses } from "../store/user/userStatuses";

export function useUserTermsAcceptingPopup() {
    const userInfoStore = useUserInfo();

    const isUserTermsAccepted = computed(() => {
        const userData = userInfoStore.getUserInfo;
        return userData.auth_fields_missed?.includes("terms_acceptance");
    });

    function runShowingTermsPopup() {
        const userStatusesStore = useUserStatuses();

        if (isUserTermsAccepted.value) {
            if (userStatusesStore.isRegisteredViaSocialNetwork) {
                userInfoStore.updateAuthDetailsProviders({
                    user: { terms_acceptance: true },
                });
            } else {
                showAcceptTermsPopup();
            }
        }
    }

    function showAcceptTermsPopup() {
        Modal.show({
            name: "modal-support",
            component: supportPopup,
            mobileFriendly: true,
            blockCloseOverlay: true,
        });
    }

    return {
        isUserTermsAccepted,
        runShowingTermsPopup,
        showAcceptTermsPopup,
    };
}
