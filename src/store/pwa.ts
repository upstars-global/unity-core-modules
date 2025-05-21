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


    function setIsPWA(isPwa?: boolean) {
        if (!isServer) {
            isPWA.value = isPwa ?? window.matchMedia("(display-mode: standalone)").matches;
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
