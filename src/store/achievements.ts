import { ACHIEV_ID, defaultDepCount, TOURNAMENT_IDS_FOR_ACHIEV } from "@config/achievements";
import featureFlags from "@theme/configs/featureFlags";
import dayjs from "dayjs";
import { defineStore, storeToRefs } from "pinia";
import { computed } from "vue";

import { betSunCompletedInTour, containAchievIdInUserStatuses } from "../helpers/achievementHelpers";
import { STATUS_PROMO } from "../models/enums/tournaments";
import { type IUserStatus } from "../models/user";
import { type IStatuses } from "../services/api/DTO/statuses";
import { useCashboxStore } from "./cashboxStore";
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

function showAchievByUserStatus(userStatuses: IUserStatus[]): number[] {
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
    const tournamentsStore = useTournamentsStore();
    const { historyDeposits } = storeToRefs(useCashboxStore());
    const { groups } = storeToRefs(useLevelsStore());

    const getTournamentForAchiev = computed<IAchievement[]>(() => {
        return tournamentsStore.getAllTournamentsOnlyUser.filter((tour) => {
            return TOURNAMENT_IDS_FOR_ACHIEV.includes(tour.frontend_identifier);
        }) as unknown as IAchievement[];
    });

    const getAchievementsAll = computed<IAchievement[]>(() => {
        // display/hide some achiev for user by status
        const arrayAchievId = showAchievByUserStatus(userStatuses.getUserStatuses);
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
            console.log("achiev", itemAchiev);
            if (itemAchiev?.frontend_identifier && itemAchiev.status === STATUS_PROMO.ARCHIVE) {
                return false;
            }

            console.log("tournamentsStore.getStatusTournamentById(itemAchiev.id)",
                tournamentsStore.getStatusTournamentById(itemAchiev.id));

            const userHasStatus = containAchievIdInUserStatuses(userStatuses.getUserStatuses, itemAchiev.id);
            console.log("userHasStatus", userStatuses.getUserStatuses, itemAchiev.id);
            if (userHasStatus) {
                return false;
            }

            console.log("itemAchiev.id", itemAchiev.id);

            const betsInTour = tournamentsStore.getStatusTournamentById(itemAchiev.id)?.bet_cents;
            const betsSumIsComplete = betSunCompletedInTour(betsInTour, itemAchiev.money_budget_cents);
            console.log("betsSumIsComplete", betsInTour, itemAchiev.money_budget_cents);
            if (betsSumIsComplete) {
                return false;
            }

            console.log("itemAchiev.id for dep count", itemAchiev.id);

            const isDoneCountDep = itemAchiev.id === ACHIEV_ID.DEP_COUNT && getDepCountForAchiev.value >= defaultDepCount;
            if (isDoneCountDep) {
                return false;
            }

            console.log("itemAchiev.id for spin count", itemAchiev.id);

            const spinsInTour = tournamentsStore.getStatusTournamentById(itemAchiev.id)?.games_taken;
            const isCompleteSpinCount = betSunCompletedInTour(spinsInTour, itemAchiev.money_budget_cents);

            if (isCompleteSpinCount) {
                return false;
            }

            console.log("itemAchiev.id final", itemAchiev.id);

            return true;
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
