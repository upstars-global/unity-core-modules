import { storeToRefs } from "pinia";

import { BrowserList } from "../consts/BrowserList";
import { useRootStore } from "../store/root";

export default function isSupportedBrowserPWA() {
    const { getBrowser, isIOSPlatform } = storeToRefs(useRootStore());

    return Object.values(BrowserList).some((elem) => {
        if (isIOSPlatform.value && elem === BrowserList.chrome) {
            return false;
        }
        return elem === getBrowser.value;
    });
}
