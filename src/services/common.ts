import { isServer } from "../helpers/ssrHelpers";
import { useCommon } from "../store/common";
import { usePWA } from "../store/pwa";
import { useUserInfo } from "../store/user/userInfo";
import { useUserStatuses } from "../store/user/userStatuses";
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
    if (!isServer) {
        const pwaStore = usePWA();

        let hasBeenSent = false;

        pwaStore.setIsPWA(); // setting default state;

        if (pwaStore.isPWA) {
            await sendPWAEvent("open");
            hasBeenSent = true;
        }

        const standaloneMediaQuery = window.matchMedia("(display-mode: standalone)");

        standaloneMediaQuery.addEventListener("change", async (event) => {
            pwaStore.setIsPWA(event.matches);
            if (event.matches && !hasBeenSent) {
                await sendPWAEvent("open");
                hasBeenSent = true;
            }
        });
    }
}

export async function sendPWAEvent(event: PWAEvent) {
    return; // todo remove when it's time to bring back pwa events
    const PWAInstallGroupId = 1401;

    const userStore = useUserInfo();
    const userStatusesStore = useUserStatuses();

    if (userStore.getIsLogged) {
        await sendPWAEventReq(event);
        await userStatusesStore.addUserToGroup(PWAInstallGroupId);
    }
}
