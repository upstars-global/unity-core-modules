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

export async function sendPWAEvent(event: PWAEvent, ignoreCheck = false) {
    console.log("sendPWAEvent");
    const pwaStore = usePWA();
    const userStore = useUserInfo();

    pwaStore.setIsPWA();
    console.log("pwaStore.isPWA", pwaStore.isPWA);
    console.log("userStore.getIsLogged", userStore.getIsLogged);

    if (ignoreCheck || (pwaStore.isPWA && userStore.getIsLogged)) {
        console.log("before request");
        await sendPWAEventReq(event);
    }
}
