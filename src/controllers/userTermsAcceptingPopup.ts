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

    function runShowingTermsPopup(force: boolean = false) {
        if (!isUserTermsAccepted.value) {
            return;
        }

        const userStatusesStore = useUserStatuses();

        if (!userStatusesStore.isRegisteredViaSocialNetwork || force) {
            showAcceptTermsPopup();
            return;
        }

        acceptTerms();
    }

    function acceptTerms() {
        const country = multilangStore.getUserGeo;

        return userInfoStore.updateAuthDetailsProviders({
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
        isUserTermsAccepted,
        runShowingTermsPopup,
        showAcceptTermsPopup,
    };
}
