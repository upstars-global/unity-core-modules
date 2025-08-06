import { defineStore } from "pinia";
import { ref } from "vue";

import { type IBettingConfig } from "../models/configs";

export const useConfigStore = defineStore("configStore", () => {
    const gamesPageLimit = ref<number>(40);
    const bettingConfig = ref<IBettingConfig | null>(null);

    function setGamesPageLimit(limit: number) {
        gamesPageLimit.value = limit;
    }

    function setBettingConfig(config: IBettingConfig | null) {
        bettingConfig.value = config;
    }

    return {
        gamesPageLimit,
        setGamesPageLimit,
        bettingConfig,
        setBettingConfig,
    };
});
