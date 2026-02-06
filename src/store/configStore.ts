import { defineStore } from "pinia";
import { ref, shallowRef } from "vue";

import { type IBettingConfig } from "../models/configs";
import { IDisabledGamesProvider } from "../models/game";
import type { IVipProgramConfig, Level, Rewards } from "../models/levels";
import { type IVipProgramConfigDTO } from "../services/api/DTO/levels";

export const useConfigStore = defineStore("configStore", () => {
    const gamesPageLimit = ref<number>(40);
    const bettingConfig = ref<IBettingConfig | null>(null);
    const vipProgramConfig = shallowRef<IVipProgramConfig | null>(null);
    const disabledGamesProviders = ref<IDisabledGamesProvider>({});

    function setGamesPageLimit(limit: number) {
        gamesPageLimit.value = limit;
    }

    function setBettingConfig(config: IBettingConfig | null) {
        bettingConfig.value = config;
    }

    function setVipProgramConfig(data: IVipProgramConfigDTO) {
        const { levelRewards,
            levelBonusesCount,
            levelCards,
            levelsConfig,
            rewardCards,
            seasonInfo,
        } = data;

        vipProgramConfig.value = {
            rewards: Object
                .entries(levelRewards)
                .reduce((acc, [ level, rewardIds ]) => {
                    acc[level as Level] = rewardIds
                        .map((id) => {
                            return rewardCards[id] && { ...rewardCards[id], id };
                        })
                        .filter(Boolean);

                    return acc;
                }, {} as Rewards),
            levelBonusesCount,
            levelCards,
            levelsConfig,
            seasonInfo,
        };
    }

    function setDisabledGamesProviders(data: IDisabledGamesProvider) {
        disabledGamesProviders.value = data;
    }

    return {
        gamesPageLimit,
        setGamesPageLimit,
        bettingConfig,
        setBettingConfig,
        vipProgramConfig,
        setVipProgramConfig,
        disabledGamesProviders,
        setDisabledGamesProviders,
    };
});
