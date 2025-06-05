import { defineStore } from "pinia";
import { ref } from "vue";

import { isServer } from "../helpers/ssrHelpers";


export const usePWA = defineStore("pwa", () => {
    const deferredPWAPrompt = ref<BeforeInstallPromptEvent | null>(initDeferredPWAPrompt());
    const showPwaInfo = ref(true);
    const isPWA = ref<boolean>(false);

    function initDeferredPWAPrompt(): BeforeInstallPromptEvent | null {
        if (isServer) {
            return null;
        }

        return window.__deferredPWAInstallEvent || null;
    }

    function setDeferredPWAPrompt(event: BeforeInstallPromptEvent) {
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
        initDeferredPWAPrompt,
    };
});
