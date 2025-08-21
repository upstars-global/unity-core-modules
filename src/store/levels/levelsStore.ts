import { mapLevelItem } from "@helpers/lootBoxes";
import { defineStore, type Pinia } from "pinia";
import { computed, ref } from "vue";

import { log } from "../../controllers/Logger";
import {
    type ILevelCard,
    ILevels,
    IStatus,
    IUserLevelInfo,
    IVipProgramConfig,
    Level,
    LevelConfig,
    Rewards,
} from "../../models/levels";
import { loadAllStatuses } from "../../services/api/requests/statuses";

const getIndex = (id: string | undefined): number | undefined => {
    if (!id) {
        return;
    }

    const [ , stringIndex ] = id.split("_");

    return Number(stringIndex);
};
export const useLevelsStore = defineStore("levelsStore", () => {
    const levelCards = ref<Record<string, ILevelCard>>({});
    const levels = ref<ILevels[]>([]);
    const groups = ref<IStatus[]>([]);
    const rewards = ref<Rewards>();
    const levelsConfig = ref<Record<Level, LevelConfig>>();

    const getLevelsData = computed<IUserLevelInfo[]>(() => {
        return levels.value
            .filter((item: IUserLevelInfo) => {
                return item.status;
            })
            .sort((current: IUserLevelInfo, next: IUserLevelInfo) => {
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

    function getLevelsById(id: string): IUserLevelInfo | Record<string, unknown> {
        return levels.value.find((el: IUserLevelInfo) => {
            return el.id === id;
        }) || {};
    }

    function getLevelImageById(level: IUserLevelInfo): string {
        const item = getLevelsData.value.find((el: IUserLevelInfo) => {
            return el.id === level.id;
        });

        return item ? item.image : "";
    }

    /* function createLevelData(mockLevels: ILevels): (someLevel: IUserLevelInfo) => IUserLevelInfo {
        return (someLevel: IUserLevelInfo) => {
            const config = mockLevels[someLevel.id];

            return {
                ...someLevel,
                image: config.image,
                gift_descriptions: config.gift_descriptions,
            };
        };
    }*/ // TODO: move to king

    function setLevelsData(data: IStatus[]) {
        const levelsList: ILevels[] = [];
        const groupsList: IStatus[] = [];

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

    async function loadLevelsData(): Promise<IStatus[]> {
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
