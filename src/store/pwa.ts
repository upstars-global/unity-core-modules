import { defineStore } from "pinia";
import { ref } from "vue";

import { isServer } from "../helpers/ssrHelpers";

export const usePWA = defineStore("pwa", () => {
    // @ts-expect-error -- TS2304: Cannot find name 'BeforeInstallPromptEvent'.
    const deferredPWAPrompt = ref<BeforeInstallPromptEvent | null>(null);
    const showPwaInfo = ref(true);
    const isPWA = ref<boolean>(false);
    // @ts-expect-error -- TS2304: Cannot find name 'BeforeInstallPromptEvent'.
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
    };
});
