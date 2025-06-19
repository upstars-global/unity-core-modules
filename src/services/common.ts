import { wait } from "../helpers/functionsHelper";
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

    async function tryAddUserToPWAGroup() {
        if (userStatusesStore.getUserGroups.length) {
            await userStatusesStore.addUserToGroup(PWAInstallGroupId);
            console.log("PWA user group added to user groups");
            return true;
        }
        console.log("No user groups loaded.");
        return false;
    }

    if (userStore.getIsLogged) {
        await sendPWAEventReq(event);

        const addedToGroup = await tryAddUserToPWAGroup();
        if (!addedToGroup) {
            console.log("First try to add user to pwa group failed, waiting for 5 seconds.");
            await wait(5000);
            await tryAddUserToPWAGroup();
        }
    }
}

