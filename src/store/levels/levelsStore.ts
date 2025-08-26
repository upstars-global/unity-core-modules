import { mapLevelItem } from "@helpers/lootBoxes";
import { ILevel } from "@types/levels";
import { defineStore, type Pinia } from "pinia";
import { computed, ref } from "vue";

import { log } from "../../controllers/Logger";
import {
    ILevelCard,
    IVipProgramConfig,
    Level,
    LevelConfig,
    Rewards,
} from "../../models/levels";
import { IStatuses } from "../../services/api/DTO/statuses";
import { loadAllStatuses } from "../../services/api/requests/statuses";

const getIndex = (id: string | undefined): number | undefined => {
    if (!id) {
        return;
    }

    const [ , stringIndex ] = id.split("_");

    return Number(stringIndex);
};

export const useLevelsStore = defineStore("levelsStore", () => {
    const levelCards = ref<Record<Level, ILevelCard>>({});
    const levels = ref<ILevel[]>([]);
    const groups = ref<IStatuses[]>([]);
    const rewards = ref<Rewards>();
    const levelsConfig = ref<Record<Level, LevelConfig>>();

    const getLevelsData = computed<ILevel[]>(() => {
        return levels.value
            .filter((item: ILevel) => {
                return item.status;
            })
            .sort((current: ILevel, next: ILevel) => {
                const currentIndex = getIndex(current.id);
                const nextIndex = getIndex(next.id);

                if (currentIndex !== undefined && nextIndex !== undefined) {
                    return currentIndex > nextIndex ? 1 : -1;
                }

                return 0;
            });
    });

    const getLevels = computed(() => {
        return levels.value;
    });

    function getLevelsById(id: string): ILevel {
        return levels.value.find((el: ILevel) => {
            return el.id === id;
        }) || {};
    }

    function getLevelImageById(level: ILevel): string {
        const item = getLevelsData.value.find((el: ILevel) => {
            return el.id === level.id;
        });

        return item ? item.image : "";
    }

    function setLevelsData(data: IStatuses[]) {
        const levelsList: ILevel[] = [];
        const groupsList: IStatuses[] = [];

        for (const item of data) {
            if (item.status) {
                levelsList.push(mapLevelItem(item));
            } else {
                groupsList.push(item);
            }
        }

        levels.value = levelsList;
        groups.value = groupsList;
    }

    async function loadLevelsData(): Promise<IStatuses[]> {
        try {
            const statuses = await loadAllStatuses();
            setLevelsData(statuses);

            return statuses;
        } catch (err) {
            log.error("LOAD_LEVELS_DATA_ERROR", err);
            throw err;
        }
    }

    function setConfigData(data: IVipProgramConfig) {
        rewards.value = data.rewardCards;
        levelsConfig.value = data.levelsConfig;
        levelCards.value = data.levelCards;
    }

    return {
        levels,
        groups,
        rewards,
        levelsConfig,
        levelCards,
        getLevelsData,
        getLevels,
        getLevelsById,
        getLevelImageById,
        loadLevelsData,
        setConfigData,
    };
});


export function useLevelsFetchService(pinia?: Pinia) {
    const { loadLevelsData } = useLevelsStore(pinia);

    return {
        loadLevelsData,
    };
}
