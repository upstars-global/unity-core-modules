import { defineStore } from "pinia";
import type { Pinia } from "pinia";
import { computed, ref } from "vue";

export const useRootStore = defineStore("rootStore", () => {
    const platform = ref(null);
    const gamePage = ref(false);
    const guest = ref(false);

    const isMobile = computed(() => platform.value && platform.value.isMobile);
    const isGamePage = computed(() => gamePage.value);
    const isGuest = computed(() => guest.value);
    const transitionName = computed(() => platform.value && platform.value.transitionName);
    const getPlatform = computed(() => platform.value);

    const setGamePage = (data) => {
        gamePage.value = data;
    };

    const setPlatform = (data) => {
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

        setGamePage,
        setPlatform,
    };
});

export function useRootStoreFetchService(pinia?: Pinia) {
    useRootStore(pinia);

    function initRootStore() {
        return Promise.resolve();
    }

    return {
        initRootStore,
    };
}
