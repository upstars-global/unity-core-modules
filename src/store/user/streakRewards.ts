import dayjs, { type Dayjs } from "dayjs";
import { defineStore } from "pinia";
import { computed } from "vue";

import { useCMS } from "../CMS";
import { useUserStatuses } from "./userStatuses";

const DATE_FORMAT = "DD/MM/YYYY";
const GROUP_DATE_PREFIX = "streak_";

export type IStreakConfig = Record<string, string[]>;

export interface IParsedStreak {
    winnerGroup: string;
    dayGroups: string[];
    startDate: Dayjs;
    endDate: Dayjs;
}

export interface IStreakDay {
    dayNumber: number;
    date: string;
    isToday: boolean;
    isCompleted: boolean;
    isMissed: boolean;
    isFuture: boolean;
}

export enum StreakWidgetState {
    FirstDay = 1,
    Broken = 2,
    InProgress = 3,
    Completed = 4,
    Lost = 5,
    Claimed = 6,
}

function parseGroupDate(group: string): Dayjs {
    return dayjs.utc(group.replace(GROUP_DATE_PREFIX, ""), DATE_FORMAT);
}

export const useStreakRewards = defineStore("streakRewards", () => {
    const userStatusesStore = useUserStatuses();
    const cmsStore = useCMS();

    const now = computed<Dayjs>(() => dayjs().utc());

    const streaksConfig = computed<IStreakConfig | null>(() => {
        return (cmsStore.currentStaticPage?.json?.streaks as IStreakConfig) || null;
    });

    const userGroupNames = computed<string[]>(() => {
        return userStatusesStore.getUserStatuses.map((status) => String(status.name));
    });

    const sortedStreaks = computed<IParsedStreak[]>(() => {
        if (!streaksConfig.value) {
            return [];
        }

        return Object.entries(streaksConfig.value)
            .map(([ winnerGroup, dayGroups ]) => {
                const dates = dayGroups.map(parseGroupDate);
                const startDate = dates[0];
                const endDate = dates[dates.length - 1];

                return { winnerGroup, dayGroups, startDate, endDate };
            })
            .filter((streak): streak is IParsedStreak => Boolean(streak.startDate && streak.endDate))
            .sort((a, b) => a.startDate.diff(b.startDate));
    });

    const activeStreak = computed<IParsedStreak | null>(() => {
        const streaks = sortedStreaks.value;

        if (!streaks.length) {
            return null;
        }

        const startedStreaks = streaks.filter((streak) => !now.value.isBefore(streak.startDate, "day"));

        return startedStreaks.length
            ? startedStreaks[startedStreaks.length - 1] ?? null
            : streaks[0] ?? null;
    });

    const nextStreak = computed<IParsedStreak | null>(() => {
        const active = activeStreak.value;

        if (!active) {
            return sortedStreaks.value[0] ?? null;
        }

        const activeIndex = sortedStreaks.value.indexOf(active);

        return sortedStreaks.value[activeIndex + 1] ?? null;
    });

    const winnerGroup = computed<string | null>(() => {
        return activeStreak.value?.winnerGroup ?? null;
    });

    const daysDetails = computed<IStreakDay[]>(() => {
        const streak = activeStreak.value;

        if (!streak) {
            return [];
        }

        return streak.dayGroups.map((group, index) => {
            const date = parseGroupDate(group);
            const isCompleted = userGroupNames.value.includes(group);

            return {
                dayNumber: index + 1,
                date: date.format(DATE_FORMAT),
                isToday: now.value.isSame(date, "day"),
                isCompleted,
                isMissed: now.value.isAfter(date, "day") && !isCompleted,
                isFuture: now.value.isBefore(date, "day"),
            };
        });
    });

    const completedDaysCount = computed<number>(() => {
        return daysDetails.value.filter((day) => day.isCompleted).length;
    });

    const allDaysCompleted = computed<boolean>(() => {
        return daysDetails.value.length > 0 && completedDaysCount.value === daysDetails.value.length;
    });

    const hasClaimedReward = computed<boolean>(() => {
        return Boolean(winnerGroup.value) && userGroupNames.value.includes(winnerGroup.value as string);
    });

    const isStreakOver = computed<boolean>(() => {
        const streak = activeStreak.value;

        if (!streak) {
            return false;
        }

        return now.value.isAfter(streak.endDate, "day");
    });

    const showDays = computed<boolean>(() => {
        return Boolean(activeStreak.value) && !isStreakOver.value;
    });

    const showTimer = computed<boolean>(() => {
        return isStreakOver.value && Boolean(nextStreak.value);
    });

    const widgetState = computed<StreakWidgetState>(() => {
        const streak = activeStreak.value;

        if (!streak) {
            return StreakWidgetState.FirstDay;
        }

        if (hasClaimedReward.value) {
            return StreakWidgetState.Claimed;
        }

        const isLastDay = now.value.isSame(streak.endDate, "day");
        const hasMissedAny = daysDetails.value.some((day) => day.isMissed);

        if (isStreakOver.value || (isLastDay && hasMissedAny)) {
            return StreakWidgetState.Lost;
        }

        if (allDaysCompleted.value) {
            return StreakWidgetState.Completed;
        }

        if (hasMissedAny) {
            return StreakWidgetState.Broken;
        }

        if (completedDaysCount.value === 0) {
            return StreakWidgetState.FirstDay;
        }

        return StreakWidgetState.InProgress;
    });

    return {
        streaksConfig,
        sortedStreaks,
        activeStreak,
        nextStreak,
        winnerGroup,
        daysDetails,
        completedDaysCount,
        allDaysCompleted,
        hasClaimedReward,
        isStreakOver,
        showDays,
        showTimer,
        widgetState,
    };
});
