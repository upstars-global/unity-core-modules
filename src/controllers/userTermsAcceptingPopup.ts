import { computed } from "vue";

import { updateAuthDetailsProviders } from "../services/user";
import { useConfigStore } from "../store/configStore";
import { useMultilangStore } from "../store/multilang";
import { useUserInfo } from "../store/user/userInfo";

export function useUserTermsAcceptingPopup() {
    const { $defaultProjectConfig } = useConfigStore();
    const { modal, supportPopupComponent } = $defaultProjectConfig;
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
        modal.show({
            name: "modal-support",
            component: supportPopupComponent,
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
