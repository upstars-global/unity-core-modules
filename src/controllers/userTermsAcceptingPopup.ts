const supportPopup = defineAsyncComponent(() => {
    return import("@modules/Popups/SupportPopup/SupportPopup.vue");
});

import Modal from "@plugins/Modal";
import { computed, defineAsyncComponent } from "vue";

import { useMultilangStore } from "../store/multilang";
import { useUserInfo } from "../store/user/userInfo";
import { useUserStatuses } from "../store/user/userStatuses";

export function useUserTermsAcceptingPopup() {
    const userInfoStore = useUserInfo();
    const multilangStore = useMultilangStore();

    const isUserTermsAccepted = computed(() => {
        return userInfoStore.getUserInfo.auth_fields_missed?.includes("terms_acceptance");
    });

    const isUserCountryFieldMissing = computed(() => {
        return userInfoStore.getUserInfo.auth_fields_missed?.includes("country");
    });

    function runShowingTermsPopup() {
        const userStatusesStore = useUserStatuses();

        if (isUserTermsAccepted.value) {
            if (userStatusesStore.isRegisteredViaSocialNetwork) {
                const country = multilangStore.getUserGeo;

                userInfoStore.updateAuthDetailsProviders({
                    user: {
                        terms_acceptance: true,
                        ...(isUserCountryFieldMissing.value ? { country } : {}),
                    },
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
