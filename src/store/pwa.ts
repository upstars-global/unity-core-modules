import { defineStore } from "pinia";
import { ref } from "vue";

import { isServer } from "../helpers/ssrHelpers";

function initDeferredPWAPrompt(): BeforeInstallPromptEvent | null {
    console.log("initDeferredPWAPrompt", isServer, window.__deferredPWAInstallEvent);

    if (isServer) {
        return null;
    }

    return window.__deferredPWAInstallEvent || null;
}

export const usePWA = defineStore("pwa", () => {
    const deferredPWAPrompt = ref<BeforeInstallPromptEvent | null>(initDeferredPWAPrompt());
    const showPwaInfo = ref(true);
    const isPWA = ref<boolean>(false);

    function setDeferredPWAPrompt(event: BeforeInstallPromptEvent) {
        console.log("setDeferredPWAPrompt", event);
        deferredPWAPrompt.value = event;
    }

    function setShowPwaInfo(value: boolean) {
        showPwaInfo.value = value;
    }


    function setIsPWA(value?: boolean) {
        if (!isServer) {
            isPWA.value = value ?? window.matchMedia("(display-mode: standalone)").matches;
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
