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
    const PWAInstallGroupId = 1401;

    const userStore = useUserInfo();
    const userStatusesStore = useUserStatuses();

    if (userStore.getIsLogged) {
        await sendPWAEventReq(event);
        console.log("sendPWAEvent, userGroups: ", userStatusesStore.getUserGroups);
        if (userStatusesStore.getUserGroups.length) {
            await userStatusesStore.addUserToGroup(PWAInstallGroupId);
        } else {
            console.log("no user groups found for request, enabling 10s timeout ");
            setTimeout(async() => {
                console.log("inside timeout");
                if (userStatusesStore.getUserGroups.length) {
                    await userStatusesStore.addUserToGroup(PWAInstallGroupId);
                } else {
                    console.log("no user groups found for request second time, cancleling adding to group ");
                }
            }, 10000);
        }
    }
}
