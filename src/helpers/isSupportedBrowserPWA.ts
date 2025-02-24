import { storeToRefs } from "pinia";

import { BrowserList } from "../consts/BrowserList";
import { useRootStore } from "../store/root";

const supportBrowsers = [ "Chrome", "Safari", "Mobile Safari" ];

export default function isSupportedBrowserPWA() {
    const { getBrowser, isIOSPlatform } = storeToRefs(useRootStore());

    return supportBrowsers.some((elem) => {
        if (isIOSPlatform.value && elem === BrowserList.chrome) {
            return false;
        }
        return elem === getBrowser.value;
    });
}
