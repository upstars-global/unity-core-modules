import { useCommon } from "../store/common";
import { usePWA } from "../store/pwa";
import type { PWAEvent } from "./api/DTO/PWAEvent";
import { fetchCurrentIPReq, sendPWAEventReq } from "./api/requests/common";

export async function loadCurrentIP() {
    const commonStore = useCommon();
    const data = await fetchCurrentIPReq();

    if (data) {
        commonStore.setCurrentIpInfo(data);
    }
}

export async function sendPWAEvent(event: PWAEvent) {
    const pwaStore = usePWA();
    pwaStore.setIsPWA();
    if (pwaStore.isPWA) {
        await sendPWAEventReq(event);
    }
}
