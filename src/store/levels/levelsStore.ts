import { defineStore, type Pinia } from "pinia";
import { computed, ref } from "vue";

import log from "../../controllers/Logger";
import type { IGroup, ILevels, IUserLevelInfo } from "../../models/levels";
import { http } from "../../services/api/http";

const getIndex = (id: string | undefined): number | undefined => {
    if (!id) {
        return;
    }

    const [ , stringIndex ] = id.split("_");

    return Number(stringIndex);
};

export function createLevelsStore(LEVELS: Record<string, unknown> = {}) {
    return defineStore("levelsStore", () => {
        const levels = ref<IUserLevelInfo[]>([]);
        const groups = ref<IGroup[]>([]);

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

        function createLevelData(mockLevels: ILevels): (someLevel: IUserLevelInfo) => IUserLevelInfo {
            return (someLevel: IUserLevelInfo) => {
                const config = mockLevels[someLevel.id];

                return {
                    ...someLevel,
                    image: config.image,

                    gift_descriptions: config.gift_descriptions,
                };
            };
        }

        function setLevelsData(data) {
            // Защита от дурака
            levels.value = data
                .filter(({ status }) => {
                    return status;
                })
                .map(createLevelData(LEVELS));

            groups.value = data.filter(({ status }) => {
                return !status;
            });
        }

        async function loadLevelsData({ reload }: { reload?: boolean } = {}): Promise<IGroup[]> {
            if (!reload && levels.value.length) {
                return levels.value;
            }
            try {
                const { data } = await http().get("/api/info/statuses");
                setLevelsData(data);
                return data;
            } catch (err) {
                log.error("LOAD_LEVELS_DATA_ERROR", err);
                throw err;
            }
        }

        return {
            groups,
            getLevelsData,
            getLevelsById,
            getLevelImageById,
            createLevelData,
            loadLevelsData,
        };
    });
}

export function useLevelsFetchService(LEVELS: Record<string, unknown>, pinia?: Pinia) {
    const levelsStore = createLevelsStore(LEVELS);

    const { loadLevelsData } = levelsStore(pinia);

    return {
        loadLevelsData,
    };
}
