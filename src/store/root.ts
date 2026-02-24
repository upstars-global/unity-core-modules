import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { getBrowserName, isAndroidUserAgent, isIOSUserAgent } from "../helpers/platformHelpers";
import type { IPlatformState } from "../helpers/userAgentPlatform";

export const useRootStore = defineStore("rootStore", () => {
    const platform = ref<IPlatformState | null>(null);
    const gamePage = ref(false);
    const guest = ref(false);

    const isMobile = computed(() => platform.value && platform.value.isMobile);
    const isGamePage = computed(() => gamePage.value);
    const isGuest = computed(() => guest.value);
    const transitionName = computed(() => platform.value && platform.value.transitionName);
    const getPlatform = computed(() => platform.value);

    const isIOSPlatform = computed(() => {
        return isIOSUserAgent(platform.value?.userAgentHints);
    });
    const isAndroidPlatform = computed(() => {
        return isAndroidUserAgent(platform.value?.userAgentHints);
    });
    const getBrowser = computed(() => {
        return getBrowserName(platform.value?.userAgentHints);
    });

    const setGamePage = (data: boolean) => {
        gamePage.value = data;
    };
    const setPlatform = (data: IPlatformState) => {
        platform.value = data;
    };

    return {
        platform,
        gamePage,
        guest,

        isMobile,
        isGamePage,
        isGuest,
        transitionName,
        getPlatform,
        isAndroidPlatform,
        isIOSPlatform,
        getBrowser,

        setGamePage,
        setPlatform,
    };
});
