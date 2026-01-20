import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { promoFilterAndSettings } from "../../helpers/promoHelpers";
import { findNextLevelData, getCurrentLevelData, questSizeById, questSlugById } from "../../helpers/questHelpers";
import { PromoType } from "../../models/enums/tournaments";
import type { ICurrentUserQuestsStatus, IQuestData, IQuestItem, IUserStatusQuest } from "../../models/quest";
import { type ITournament } from "../../services/api/DTO/tournamentsDTO";
import { useConfigStore } from "../configStore";

function promoFilterAndSettingsOneItem(item: IQuestData, type: PromoType) {
    const [ result ] = promoFilterAndSettings([ item ], type);
    return result;
}

export const useQuestStore = defineStore("questStore", () => {
    const { $defaultProjectConfig } = useConfigStore();
    const { getQuestConfig, DEFAULT_QUEST_SIZE } = $defaultProjectConfig;
    const userStatusQuest = ref<IUserStatusQuest>({} as IUserStatusQuest);
    const questsList = ref<IQuestItem[]>([]);
    const currentUserQuestsStatuses = ref<ICurrentUserQuestsStatus[]>([]);
    const questData = ref<IQuestData | null>(null);

    const getQuestData = computed(() => {
        if (questData.value?.id) {
            return promoFilterAndSettingsOneItem(questData.value, PromoType.QUEST);
        }

        return questData.value;
    });

    const getCurrentUserBets = computed(() => {
        return Number(userStatusQuest.value?.bets || 0);
    });

    const getUserBetsInQuestById = computed(() => {
        return (id: number) => {
            let userStatusInQuest = null;

            if (currentUserQuestsStatuses.value.length) {
                userStatusInQuest = currentUserQuestsStatuses.value.find(({ tournament_id: tourId }) => {
                    return tourId === id;
                });
            }

            return userStatusInQuest && Number(userStatusInQuest?.bets);
        };
    });

    const getCurrentLevelPoint = computed(() => {
        if (!getQuestData.value) {
            return [];
        }

        const defaultCurrency = getQuestData.value?.currency;
        const questSize = getQuestData.value.questSize;
        const userBets = getCurrentUserBets.value;

        return getCurrentLevelData(questSize, defaultCurrency, userBets);
    });

    const getListQuestsLevelPoint = computed(() => {
        const result = {} as Record<number, never[] | [string, unknown]>;

        if (getQuestsList.value) {
            getQuestsList.value.forEach((questItem) => {
                const userBets = getUserBetsInQuestById.value(questItem.id);
                const defaultCurrency = questItem?.currency;

                if (!questItem) {
                    return [];
                }

                const questSize = questItem.questSize;

                result[questItem.id] = getCurrentLevelData(questSize, defaultCurrency, userBets);
            });
        }

        return result;
    });

    const getNextLevelPoint = computed(() => {
        if (!getQuestData.value) {
            return [];
        }
        const defaultCurrency = getQuestData.value?.currency;
        const [ , currentLevelData ] = getCurrentLevelPoint.value;
        const questSize = getQuestData.value.questSize;

        return findNextLevelData(questSize, currentLevelData, defaultCurrency, getCurrentUserBets.value);
    });

    function getNextLevelPointByIdQuest(id: number) {
        let quest = null;
        if (questsList.value) {
            quest = questsList.value.find(({ id: questId }) => {
                return questId === id;
            });
        }
        if (!quest) {
            return [];
        }
        const defaultCurrency = quest?.currency;
        const currentLevelData = getListQuestsLevelPoint.value[id]?.[1];
        const userBetsInTargetQuest = getUserBetsInQuestById.value(id);

        return findNextLevelData(quest.questSize, currentLevelData, defaultCurrency, userBetsInTargetQuest);
    }

    const getCountLevelsCurrentQuest = computed(() => {
        const questSize = getQuestData.value?.questSize;
        return questSize && Object.entries(getQuestConfig(questSize).mockLevels).length;
    });

    const getQuestsList = computed(() => {
        return promoFilterAndSettings(questsList.value, PromoType.QUEST);
    });

    function getQuestById(targetId: number) {
        return getQuestsList.value.find(({ id }) => {
            return id === targetId;
        });
    }

    function getPointsInQuestById(id: number) {
        const quest = getQuestById(id);
        if (quest) {
            return Object.entries(getQuestConfig(quest?.questSize).mockLevels);
        }

        return [];
    }

    function clearQuestUserData() {
        userStatusQuest.value = {} as IUserStatusQuest;
        currentUserQuestsStatuses.value = [] as ICurrentUserQuestsStatus[];
    }

    function setNewStatusesUserQuest(newData: ICurrentUserQuestsStatus[]): void {
        let newState = [] as ICurrentUserQuestsStatus[];
        if (currentUserQuestsStatuses.value) {
            newState = [
                ...currentUserQuestsStatuses.value.filter(({ tournament_id: questId }) => {
                    return !newData.some(({ tournament_id: newID }) => {
                        return newID === questId;
                    });
                }),
                ...newData,
            ];
            currentUserQuestsStatuses.value = newState;
        }
    }

    function setQuestsList(newList: ITournament[] = []) {
        questsList.value = [
            ...questsList.value.filter(({ id }) => {
                return !newList.some(({ id: newID }) => {
                    return newID === id;
                });
            }),
            ...newList,
        ].map((quest) => {
            return {
                ...quest,
                questSize: questSizeById(quest.frontend_identifier) || DEFAULT_QUEST_SIZE,
                questSlug: questSlugById(quest.frontend_identifier),
            };
        });
    }

    function setCurrentQuestFromList(slug: string, priorityId?: number | null) {
        questData.value = questsList.value.find(({ frontend_identifier: frontId, group_ids }) => {
            return frontId.includes(slug) && (!priorityId || group_ids.includes(priorityId));
        }) || {} as IQuestData;
    }


    function updateStatusInQuest(promoList: ICurrentUserQuestsStatus[]) {
        const quest = getQuestData.value;

        if (!quest) {
            return;
        }

        promoList.forEach((promoData) => {
            if (quest.id === promoData.tournament_id) {
                setNewStatusesUserQuest([ promoData ]);
            }
        });
    }

    return {
        getQuestData,
        getCurrentUserBets,
        getUserBetsInQuestById,
        getCurrentLevelPoint,
        getListQuestsLevelPoint,
        getNextLevelPoint,
        getNextLevelPointByIdQuest,
        getCountLevelsCurrentQuest,
        getQuestsList,
        getPointsInQuestById,

        clearQuestUserData,
        setCurrentQuestFromList,

        updateStatusInQuest,
        setQuestsList,
        setNewStatusesUserQuest,
    };
});
