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

function showAchievByUserStatus(userStatuses: IUserStatus[], featureFlagsProps: Record<string, boolean>, ACHIEV_ID): number[] {
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
        ...(showAchievExCoin && featureFlagsProps.enableConpoints ? [ ACHIEV_ID.COMPOINT_CHANGE ] : []),
        ...(showAchievDepPS ? [ ACHIEV_ID.DEP_PS ] : []),
        ...(showAchievDepCount ? [ ACHIEV_ID.DEP_COUNT ] : []),
    ];
}

export const useAchievements = defineStore("achievements", () => {
    const { $defaultProjectConfig } = useConfigStore();

    const userStatuses = useUserStatuses();
    const tournamentsStore = useTournamentsStore();
    const { historyDeposits } = storeToRefs(useCashboxStore());
    const { groups } = storeToRefs(useLevelsStore());

    const getTournamentForAchiev = computed<IAchievement[]>(() => {
        return tournamentsStore.getAllTournamentsOnlyUser.filter((tour) => {
            return $defaultProjectConfig.TOURNAMENT_IDS_FOR_ACHIEV.includes(tour.frontend_identifier);
        }) as unknown as IAchievement[];
    });

    const getAchievementsAll = computed<IAchievement[]>(() => {
        // display/hide some achiev for user by status
        const arrayAchievId = showAchievByUserStatus(
            userStatuses.getUserStatuses,
            $defaultProjectConfig.featureFlags,
            $defaultProjectConfig.ACHIEV_ID,
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
            if (
                "frontend_identifier" in itemAchiev &&
                itemAchiev.frontend_identifier &&
                itemAchiev.status === STATUS_PROMO.ARCHIVE
            ) {
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

            const isDoneCountDep = itemAchiev.id === $defaultProjectConfig.ACHIEV_ID.DEP_COUNT ?
                getDepCountForAchiev.value >= $defaultProjectConfig.defaultDepCount :
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
