import { defineStore } from "pinia";
import { ref } from "vue";

import { isServer } from "../helpers/ssrHelpers";

export const usePWA = defineStore("pwa", () => {
    const deferredPWAPrompt = ref<BeforeInstallPromptEvent | null>(null);
    const showPwaInfo = ref(true);
    const isPWA = ref<boolean>(false);
    function setDeferredPWAPrompt(event: BeforeInstallPromptEvent) {
        deferredPWAPrompt.value = event;
    }

    function setShowPwaInfo(value: boolean) {
        showPwaInfo.value = value;
    }


    function setIsPWA(value?: boolean) {
        if (!isServer) {
            console.log("inside setIsPWA", value);
            isPWA.value = value ?? window.matchMedia("(display-mode: standalone)").matches;
            console.log("inside setIsPWA after", isPWA.value);
        }
    }

    return {
        isPWA,
        deferredPWAPrompt,
        showPwaInfo,
        setDeferredPWAPrompt,
        setShowPwaInfo,
        setIsPWA,
    };
});
