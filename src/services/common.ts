import { useCommon } from "../store/common";
import { usePWA } from "../store/pwa";
import { useUserInfo } from "../store/user/userInfo";
import type { PWAEvent } from "./api/DTO/PWAEvent";
import { fetchCurrentIPReq, sendPWAEventReq } from "./api/requests/common";

export async function loadCurrentIP() {
    const commonStore = useCommon();
    const data = await fetchCurrentIPReq();

    if (data) {
        commonStore.setCurrentIpInfo(data);
    }
}

export async function subscribeToStandaloneMQL() {
    const pwaStore = usePWA();
    const userStore = useUserInfo();
    let hasBeenSent = false;

    pwaStore.setIsPWA(); // setting default state;

    if (pwaStore.isPWA) {
        await sendPWAEvent("open");
        hasBeenSent = true;
    }

    const standaloneMediaQuery = window.matchMedia("(display-mode: standalone)");

    standaloneMediaQuery.addEventListener("change", async (event) => {
        pwaStore.setIsPWA(event.matches);
        if (event.matches && !hasBeenSent && userStore.getIsLogged) {
            await sendPWAEvent("open");
            hasBeenSent = true;
        }
    });
}

export async function sendPWAEvent(event: PWAEvent) {
    await sendPWAEventReq(event);
}
