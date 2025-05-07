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

export async function sendPWAEvent(event: PWAEvent) {
    const pwaStore = usePWA();
    const userStore = useUserInfo();
    pwaStore.setIsPWA();
    if (pwaStore.isPWA && userStore.getIsLogged) {
        await sendPWAEventReq(event);
        console.log("PWAEvent sent");
    }
}
