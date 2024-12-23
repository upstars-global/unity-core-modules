import getQuestConfig, { DEFAULT_QUEST_SIZE } from "@config/quest";
import { useUserInfo } from "@store/user/userInfo";
import { defineStore, storeToRefs } from "pinia";
import { computed, ref } from "vue";

import log from "../../controllers/Logger";
import { wait } from "../../helpers/functionsHelper";
import { promoFilterAndSettings } from "../../helpers/promoHelpers";
import { findNextLevelData, getCurrentLevelData, isQuest, questSizeById, questSlugById } from "../../helpers/questHelpers";
import { PromoType } from "../../models/enums/tournaments";
import type { ICurrentUserQuestsStatus, IQuestData, IQuestItem, IUserStatusQuest } from "../../models/quest";
import type { ITournamentsList } from "../../services/api/DTO/tournamentsDTO";
import { http } from "../../services/api/http";

function promoFilterAndSettingsOneItem(item, type) {
    const [ result ] = promoFilterAndSettings([ item ], type);
    return result;
}

export const useQuestStore = defineStore("questStore", () => {
    const userStatusQuest = ref<IUserStatusQuest>({} as IUserStatusQuest);
    const questsList = ref<IQuestItem[]>([]);
    const currentUserQuestsStatuses = ref<ICurrentUserQuestsStatus[]>([]);
    const { getIsLogged } = storeToRefs(useUserInfo());
    const openedQuestSlug = ref<string>("");

    const questData = computed(() => {
        return questsList.value.find((questItem) => questItem.frontend_identifier.includes(openedQuestSlug.value));
    });

    const getQuestData = computed(() => {
        if (questData.value) {
            questData.value.group_ids = [];
        }
        if (questData.value && questData.value.id) {
            return promoFilterAndSettingsOneItem(questData.value, PromoType.QUEST);
        }

        return questData.value;
    });

    const getCurrentUserBets = computed(() => {
        return Number(userStatusQuest.value?.bets);
    });

    const getUserBetsInQuestById = computed(() => {
        return (id: number) => {
            let userStatusInQuest = null;

            if (currentUserQuestsStatuses.value) {
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
        const result = {};
        if (getQuestsList.value) {
            getQuestsList.value.forEach((questItem) => {
                const userBets = getUserBetsInQuestById.value(questItem.id);
                const defaultCurrency = questItem?.currency;

                if (!questItem) {
                    return [];
                }

                const questSize = questItem.questSize;
                // @ts-expect-error Element implicitly has an 'any' type
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
        // @ts-expect-error Element implicitly has an 'any' type
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

    function setQuestsList(newList: IQuestItem[] = []) {
        let newQuestsList = [] as IQuestItem[];
        if (questsList.value) {
            newQuestsList = [
                ...questsList.value.filter(({ id }) => {
                    return !newList.some(({ id: newID }) => {
                        return newID === id;
                    });
                }),
                ...newList,
            ].map((quest) => {
                quest.questSize = questSizeById(quest.frontend_identifier) || DEFAULT_QUEST_SIZE;
                quest.questSlug = questSlugById(quest.frontend_identifier);

                return quest;
            });
        }

        questsList.value = newQuestsList;
    }

    function setCurrentQuestFromList(slug: string) {
        if (questsList.value) {
            // @ts-expect-error Cannot assign to 'value' because it is a read-only property.
            questData.value = questsList.value.find(({ frontend_identifier: frontId }) => {
                return frontId.includes(slug);
            }) || {} as IQuestData;
        }
    }

    async function loadQuestsData(tournamentsList: ITournamentsList) {
        if (!tournamentsList.length) {
            await wait(200);
            loadQuestsData(tournamentsList);
            return;
        }
        const filteredQuestsList = [ ...tournamentsList ].filter(({ frontend_identifier: frontId }) => {
            return isQuest(frontId);
        });
        // @ts-expect-error missing properties
        setQuestsList(filteredQuestsList);
        if (getIsLogged.value) {
            try {
                const statuses = await Promise.all(
                    filteredQuestsList.map((questItem) => {
                        return http().get(`/api/tournaments/${ questItem.id }/status`);
                    }),
                );
                setNewStatusesUserQuest(statuses.map(({ data }) => {
                    return data;
                }));
            } catch (err) {
                log.error("LOAD_QUESTS_DATA_ERROR", err);
            }
        }
    }

    function updateStatusInQuest(promoList: ICurrentUserQuestsStatus[]) {
        if (!getQuestData.value) {
            return;
        }

        promoList.forEach((promoData) => {
            if (getQuestData.value.id === promoData.tournament_id) {
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

        loadQuestsData,
        updateStatusInQuest,
    };
});
