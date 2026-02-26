import { mapLevelItem } from "@helpers/lootBoxes";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { ILevel } from "../../models/levels";
import { IStatuses } from "../../services/api/DTO/statuses";

const getIndex = (id: string | undefined): number | undefined => {
    if (!id) {
        return;
    }

    const [ , stringIndex ] = id.split("_");

    return Number(stringIndex);
};

export const useLevelsStore = defineStore("levelsStore", () => {
    const levels = ref<ILevel[]>([]);
    const groups = ref<IStatuses[]>([]);

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
        }) || {} as ILevel;
    }

    function getLevelImageById(level: ILevel): string {
        const item = getLevelsData.value.find((el) => {
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

    return {
        levels,
        groups,
        getLevelsData,
        getLevels,
        getLevelsById,
        getLevelImageById,
        setLevelsData,
    };
});
