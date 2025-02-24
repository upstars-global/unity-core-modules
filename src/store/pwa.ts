import { defineStore } from "pinia";
import { ref } from "vue";

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


    function setIsPWA() {
        isPWA.value = window.matchMedia("(display-mode: standalone)").matches;
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
