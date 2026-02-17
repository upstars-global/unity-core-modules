import {
    ACHIEV_ID_COMPOINT_CHANGE,
    ACHIEV_ID_DEP_COUNT,
    ACHIEV_ID_DEP_PS,
    ACHIEV_ID_EMAIL_CONFIRM,
    ACHIEV_ID_EMAIL_CONFIRM_AND_MORE,
    ACHIEV_ID_EXCHANGE_COIN,
    ACHIEV_IDS_ALL,
    TOUR_ID_ACHIEV_SPIN_COUNT,
    TOURNAMENT_IDS_FOR_ACHIEV,
} from "@config/achievements";
import dayjs from "dayjs";
import { defineStore, storeToRefs } from "pinia";
import { computed } from "vue";

import { betSunCompletedInTour, containAchievIdInUserStatuses } from "../helpers/achievementHelpers";
import { STATUS_PROMO } from "../models/enums/tournaments";
import { type IUserStatus } from "../models/user";
import { type IStatuses } from "../services/api/DTO/statuses";
import { useCashboxStore } from "./cashboxStore";
import { useConfigStore } from "./configStore";
import { useLevelsStore } from "./levels/levelsStore";
import { useTournamentsStore } from "./tournaments/tournamentsStore";
import { useUserStatuses } from "./user/userStatuses";

const defaultDepDateStartCount = "2022-03-29T00:00:00Z";

type IAchievement = Omit<IStatuses, "status" | "id"> & {
    frontend_identifier: string | number;
    status: string;
    money_budget_cents: string;
    id: number;
};

function showAchievByUserStatus(userStatuses: IUserStatus[], isEnableConpoints: boolean): number[] {
    const showAchievEmail = userStatuses.some((status) => {
        return ACHIEV_IDS_ALL.EMAIL_CONFIRM.includes(Number(status.id));
    });

    const showAchievEmailConfirmAndAction = userStatuses.some((status) => {
        return ACHIEV_IDS_ALL.EMAIL_CONFIRM_AND_MORE.includes(Number(status.id));
    });

    /*
    // uncomment if you want ot enable AchievReceivePromo
    const showAchievReceivePromo = userStatuses.some((status) => {
        return Boolean(ACHIEV_IDS_ALL.RECEIVE_PROMOS.includes(Number(status.id)));
    }); */

    const showAchievExCoin = userStatuses.some((status) => {
        return [ ACHIEV_ID_EXCHANGE_COIN, ACHIEV_ID_COMPOINT_CHANGE ].includes(Number(status.id));
    });

    const showAchievDepPS = userStatuses.some((status) => {
        return ACHIEV_IDS_ALL.DEP_PS.includes(Number(status.id));
    });

    const showAchievDepCount = userStatuses.some((status) => {
        return ACHIEV_IDS_ALL.DEP_COUNT.includes(Number(status.id));
    });

    // display/hide some achiev for user by status
    return [
        ...(showAchievEmail ? [ ACHIEV_ID_EMAIL_CONFIRM ] : []),
        ...(showAchievEmailConfirmAndAction ? [ ACHIEV_ID_EMAIL_CONFIRM_AND_MORE ] : []),
        ...(showAchievExCoin && isEnableConpoints ? [ ACHIEV_ID_COMPOINT_CHANGE ] : []),
        ...(showAchievDepPS ? [ ACHIEV_ID_DEP_PS ] : []),
        ...(showAchievDepCount ? [ ACHIEV_ID_DEP_COUNT ] : []),
    ];
}

export const useAchievements = defineStore("achievements", () => {
    const userStatuses = useUserStatuses();
    const tournamentsStore = useTournamentsStore();
    const { historyDeposits } = storeToRefs(useCashboxStore());
    const { groups } = storeToRefs(useLevelsStore());
    const { $defaultProjectConfig } = useConfigStore();

    const getTournamentForAchiev = computed<IAchievement[]>(() => {
        return tournamentsStore.getAllTournamentsOnlyUser.filter((tour) => {
            return TOURNAMENT_IDS_FOR_ACHIEV.includes(tour.frontend_identifier);
        }) as unknown as IAchievement[];
    });

    const getAchievementsAll = computed<IAchievement[]>(() => {
        const arrayAchievId = showAchievByUserStatus(
            userStatuses.getUserStatuses,
            $defaultProjectConfig.featureFlags.enableConpoints,
        );
        const achievByGroups = groups.value.map((itemGroup) => {
            return {
                ...itemGroup,
                id: Number(itemGroup.id),
            };
        })
            .filter((itemGroup) => {
                return arrayAchievId.includes(itemGroup.id);
            });

        return [
            ...achievByGroups,
            ...getTournamentForAchiev.value,
        ] as IAchievement[];
    });

    const getDepCountForAchiev = computed<number>(() => {
        const countCompletedDeps = historyDeposits.value.filter((itemDep) => {
            return dayjs(itemDep.finished_at).isAfter(dayjs(defaultDepDateStartCount)) &&
                itemDep.success;
        });
        return countCompletedDeps.length;
    });

    const getAchievementsActive = computed<IAchievement[]>(() => {
        return getAchievementsAll.value.filter((itemAchiev) => {
            const frontID = itemAchiev.frontend_identifier as string;
            const achievStatusArchive = itemAchiev.status === STATUS_PROMO.ARCHIVE;

            if (frontID && achievStatusArchive) {
                return false;
            }

            // tournaments achievements
            if (frontID) {
                let tourValue = null;

                if (frontID === TOUR_ID_ACHIEV_SPIN_COUNT) {
                    tourValue = tournamentsStore.getStatusTournamentById(itemAchiev.id)?.games_taken;
                } else if (TOURNAMENT_IDS_FOR_ACHIEV.includes(frontID)) {
                    tourValue = tournamentsStore.getStatusTournamentById(itemAchiev.id)?.bet_cents;
                }

                if (tourValue) {
                    return !betSunCompletedInTour(tourValue, itemAchiev.money_budget_cents);
                }

                return true;
            }

            if (!frontID) {
                // Костыль на случай некорректной работы апи, когда возвращает 2 варианта айди для активного и неактивного статуса
                // В этом случае делаем ачивку неактивной
                const achievValues: number[][] = Object.values(ACHIEV_IDS_ALL);
                const achievArr = achievValues.find((arr) => arr?.includes(itemAchiev.id));

                if (achievArr?.every((id) => userStatuses.getUserGroups.includes(id))) {
                    return false;
                }

                return containAchievIdInUserStatuses(userStatuses.getUserStatuses, itemAchiev.id);
            }
        });
    });

    const getAchievementsHistory = computed<IAchievement[]>(() => {
        return getAchievementsAll.value.filter((itemAchiev) => {
            return !getAchievementsActive.value.some((item) => {
                return item.id === itemAchiev.id;
            });
        });
    });

    return {
        getAchievementsAll,
        getDepCountForAchiev,
        getAchievementsActive,
        getAchievementsHistory,
    };
});
