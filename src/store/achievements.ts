import { ACHIEV_ID, defaultDepCount, TOURNAMENT_IDS_FOR_ACHIEV } from "@config/achievements";
import { useLevelsStore } from "@store/levels/levelsStore";
import { useTournamentsStore } from "@store/tournaments/tournamentsStore";
import { useUserStatuses } from "@store/user/userStatuses";
import featureFlags from "@theme/configs/featureFlags";
import dayjs from "dayjs";
import { defineStore } from "pinia";
import { computed } from "vue";

import { betSunCompletedInTour, containAchievIdInUserStatuses } from "../helpers/achievmenthrlpers";
import { STATUS_PROMO } from "../models/enums/tournaments";
import type { IGroup } from "../models/levels";
import { useCashboxStore } from "./cashboxStore";

const defaultDepDateStartCount = "2022-03-29T00:00:00Z";

type IAchievement = IGroup | {
    frontend_identifier: string | number;
    status: string;
    money_budget_cents: string
};

function showAchievByUserStatus(userStatuses): number[] {
    const showAchievEmail = userStatuses.some((status) => {
        return Number(status.id) === 606 || Number(status.id) === ACHIEV_ID.EMAIL_CONFIRM;
    });

    const showAchievEmailConfirmAndAction = userStatuses.some((status) => {
        return Number(status.id) === 55 || Number(status.id) === ACHIEV_ID.EMAIL_CONFIRM_AND_MORE;
    });

    /*
    // uncomment if you want ot enable AchievReceivePromo
    const showAchievReceivePromo = userStatuses.some((status) => {
        return Number(status.id) === 402 || Number(status.id) === ACHIEV_ID_RECEIVE_PROMOS;
    }); */

    const showAchievExCoin = userStatuses.some((status) => {
        return Number(status.id) === ACHIEV_ID.EXCHANGE_COIN || Number(status.id) === ACHIEV_ID.COMPOINT_CHANGE;
    });

    const showAchievDepPS = userStatuses.some((status) => {
        return Number(status.id) === 56 || Number(status.id) === ACHIEV_ID.DEP_PS;
    });

    const showAchievDepCount = userStatuses.some((status) => {
        return Number(status.id) === ACHIEV_ID.EXCHANGE_COIN || Number(status.id) === ACHIEV_ID.DEP_COUNT;
    });

    // display/hide some achiev for user by status
    return [
        ...(showAchievEmail ? [ ACHIEV_ID.EMAIL_CONFIRM ] : []),
        ...(showAchievEmailConfirmAndAction ? [ ACHIEV_ID.EMAIL_CONFIRM_AND_MORE ] : []),
        ...(showAchievExCoin && featureFlags.enableConpoints ? [ ACHIEV_ID.COMPOINT_CHANGE ] : []),
        ...(showAchievDepPS ? [ ACHIEV_ID.DEP_PS ] : []),
        ...(showAchievDepCount ? [ ACHIEV_ID.DEP_COUNT ] : []),
    ];
}

export const useAchievements = defineStore("achievements", () => {
    const userStatuses = useUserStatuses();
    const levelsStore = useLevelsStore();
    const tournamentsStore = useTournamentsStore();
    const cashboxStore = useCashboxStore();

    const getTournamentForAchiev = computed<IAchievement[]>(() => {
        return tournamentsStore.getAllTournamentsOnlyUser.filter((tour) => {
            return TOURNAMENT_IDS_FOR_ACHIEV.includes(tour.frontend_identifier);
        });
    });

    const getAchievementsAll = computed<IAchievement[]>(() => {
        // display/hide some achiev for user by status
        const arrayAchievId = showAchievByUserStatus(userStatuses.getUserStatuses);
        const achievByGroups = levelsStore.groups.map((itemGroup) => {
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
        ];
    });

    const getDepCountForAchiev = computed<number>(() => {
        const countCompletedDeps = cashboxStore.historyDeposits.filter((itemDep) => {
            return dayjs(itemDep.finished_at).isAfter(dayjs(defaultDepDateStartCount)) &&
                itemDep.success;
        });
        return countCompletedDeps.length;
    });

    const getAchievementsActive = computed<IAchievement[]>(() => {
        return getAchievementsAll.value.filter((itemAchiev) => {
            if (itemAchiev.frontend_identifier && itemAchiev.status === STATUS_PROMO.ARCHIVE) {
                return false;
            }

            const userStatusHasAchievId = !itemAchiev.frontend_identifier ?
                containAchievIdInUserStatuses(userStatuses.getUserStatuses, itemAchiev.id) : true;

            const betsInTour = tournamentsStore.getStatusTournamentById(itemAchiev.id)?.bet_cents;
            const betsSumIsComplete = itemAchiev.frontend_identifier ?
                itemAchiev.status === STATUS_PROMO.ARCHIVE ||
                betSunCompletedInTour(betsInTour, itemAchiev.money_budget_cents)
                :
                true;

            const isDoneCountDep = itemAchiev.id === ACHIEV_ID.DEP_COUNT ?
                getDepCountForAchiev.value >= defaultDepCount :
                true;

            const spinsInTour = tournamentsStore.getStatusTournamentById(itemAchiev.id)?.games_taken;
            const isCompleteSpinCount = itemAchiev.frontend_identifier ?
                itemAchiev.status === STATUS_PROMO.ARCHIVE ||
                betSunCompletedInTour(spinsInTour, itemAchiev.money_budget_cents)
                : true;

            return !userStatusHasAchievId || !betsSumIsComplete || !isDoneCountDep || !isCompleteSpinCount;
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
