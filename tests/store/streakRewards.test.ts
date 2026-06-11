import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { reactive, ref } from "vue";

import {
    type IStreakConfig,
    StreakWidgetState,
    useStreakRewards,
} from "../../src/store/user/streakRewards";

dayjs.extend(utc);
dayjs.extend(customParseFormat);

const WINNER_GROUP = "streak_reward_1";
const NEXT_WINNER_GROUP = "streak_reward_2";

const DAY_1 = "streak_07/06/2026";
const DAY_2 = "streak_08/06/2026";
const DAY_3 = "streak_09/06/2026";
const DAY_4 = "streak_10/06/2026";
const DAY_5 = "streak_11/06/2026";
const DAY_GROUPS = [ DAY_1, DAY_2, DAY_3, DAY_4, DAY_5 ];

const NEXT_DAY_GROUPS = [
    "streak_21/06/2026",
    "streak_22/06/2026",
    "streak_23/06/2026",
    "streak_24/06/2026",
    "streak_25/06/2026",
];

const singleStreak: IStreakConfig = { [WINNER_GROUP]: DAY_GROUPS };
const twoStreaks: IStreakConfig = {
    [WINNER_GROUP]: DAY_GROUPS,
    [NEXT_WINNER_GROUP]: NEXT_DAY_GROUPS,
};

const mockCMS = {
    currentStaticPage: null as { json?: { streaks?: IStreakConfig | null } } | null,
};

const mockUserStatuses = {
    getUserStatuses: [] as Array<{ name: string }>,
};

const mockUserInfo = reactive({ getIsLogged: ref(true) });

vi.mock("../../src/store/CMS", () => ({
    useCMS: () => mockCMS,
}));

vi.mock("../../src/store/user/userStatuses", () => ({
    useUserStatuses: () => mockUserStatuses,
}));

vi.mock("../../src/store/user/userInfo", () => ({
    useUserInfo: () => mockUserInfo,
}));

function setStreaks(streaks: IStreakConfig | null): void {
    mockCMS.currentStaticPage = streaks ? { json: { streaks } } : null;
}

function setCompletedGroups(groups: string[]): void {
    mockUserStatuses.getUserStatuses = groups.map((name) => ({ name }));
}

function setNow(isoDate: string): void {
    vi.setSystemTime(new Date(isoDate));
}

function setLogged(value: boolean): void {
    mockUserInfo.getIsLogged = value;
}

describe("useStreakRewards", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        setActivePinia(createPinia());
        setStreaks(singleStreak);
        setCompletedGroups([]);
        setLogged(true);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe("config parsing", () => {
        it("returns no active streak when config is missing", () => {
            setStreaks(null);
            setNow("2026-06-08T10:00:00Z");

            const store = useStreakRewards();

            expect(store.activeStreak).toBeNull();
            expect(store.daysDetails).toEqual([]);
            expect(store.widgetState).toBe(StreakWidgetState.FirstDay);
        });

        it("parses, sorts streaks and resolves the active and next streak", () => {
            setStreaks(twoStreaks);
            setNow("2026-06-08T10:00:00Z");

            const store = useStreakRewards();

            expect(store.sortedStreaks).toHaveLength(2);
            expect(store.activeStreak?.winnerGroup).toBe(WINNER_GROUP);
            expect(store.nextStreak?.winnerGroup).toBe(NEXT_WINNER_GROUP);
            expect(store.winnerGroup).toBe(WINNER_GROUP);
        });

        it("keeps the last started streak active between two streaks", () => {
            setStreaks(twoStreaks);
            setNow("2026-06-15T10:00:00Z");

            const store = useStreakRewards();

            expect(store.activeStreak?.winnerGroup).toBe(WINNER_GROUP);
            expect(store.nextStreak?.winnerGroup).toBe(NEXT_WINNER_GROUP);
        });
    });

    describe("daysDetails flags", () => {
        it("marks completed / missed / today / future correctly", () => {
            setNow("2026-06-09T10:00:00Z");
            setCompletedGroups([ DAY_1 ]);

            const store = useStreakRewards();
            const days = store.daysDetails;

            expect(days).toHaveLength(5);
            expect(days[0]).toMatchObject({ dayNumber: 1, isCompleted: true, isMissed: false, isToday: false, isFuture: false });
            expect(days[1]).toMatchObject({ dayNumber: 2, isCompleted: false, isMissed: true, isToday: false });
            expect(days[2]).toMatchObject({ dayNumber: 3, isToday: true, isMissed: false, isFuture: false });
            expect(days[3]).toMatchObject({ dayNumber: 4, isFuture: true, isMissed: false });
            expect(days[4]?.isFuture).toBe(true);
            expect(store.completedDaysCount).toBe(1);
        });
    });

    describe("widgetState", () => {
        it("FirstDay before the streak starts", () => {
            setNow("2026-06-01T10:00:00Z");

            const store = useStreakRewards();

            expect(store.widgetState).toBe(StreakWidgetState.FirstDay);
            expect(store.currentDayNumber).toBe(1);
        });

        it("FirstDay on day 1 with nothing completed", () => {
            setNow("2026-06-07T10:00:00Z");

            const store = useStreakRewards();

            expect(store.widgetState).toBe(StreakWidgetState.FirstDay);
        });

        it("InProgress while progressing without misses, today not done yet", () => {
            setNow("2026-06-08T10:00:00Z");
            setCompletedGroups([ DAY_1 ]);

            const store = useStreakRewards();

            expect(store.widgetState).toBe(StreakWidgetState.InProgress);
            expect(store.currentDayNumber).toBe(2);
        });

        it("InProgress with today already done", () => {
            setNow("2026-06-08T10:00:00Z");
            setCompletedGroups([ DAY_1, DAY_2 ]);

            const store = useStreakRewards();

            expect(store.widgetState).toBe(StreakWidgetState.InProgress);
            expect(store.currentDayNumber).toBe(2);
        });

        it("InProgress on the last day without misses", () => {
            setNow("2026-06-11T10:00:00Z");
            setCompletedGroups([ DAY_1, DAY_2, DAY_3, DAY_4 ]);

            const store = useStreakRewards();

            expect(store.widgetState).toBe(StreakWidgetState.InProgress);
            expect(store.currentDayNumber).toBe(5);
        });

        it("Broken once a day was missed mid-streak (reported bug)", () => {
            setNow("2026-06-08T10:00:00Z");
            setCompletedGroups([ DAY_2 ]);

            const store = useStreakRewards();

            expect(store.widgetState).toBe(StreakWidgetState.Broken);
        });

        it("Broken even when later days are completed after a miss", () => {
            setNow("2026-06-10T10:00:00Z");
            setCompletedGroups([ DAY_1, DAY_3 ]);

            const store = useStreakRewards();

            expect(store.widgetState).toBe(StreakWidgetState.Broken);
        });

        it("Completed when all days are done and reward is not claimed", () => {
            setNow("2026-06-11T10:00:00Z");
            setCompletedGroups([ ...DAY_GROUPS ]);

            const store = useStreakRewards();

            expect(store.allDaysCompleted).toBe(true);
            expect(store.widgetState).toBe(StreakWidgetState.Completed);
        });

        it("Lost on the last day when some days were missed", () => {
            setNow("2026-06-11T10:00:00Z");
            setCompletedGroups([ DAY_1, DAY_2, DAY_3 ]);

            const store = useStreakRewards();

            expect(store.widgetState).toBe(StreakWidgetState.Lost);
            expect(store.completedDaysCount).toBe(3);
        });

        it("Lost after the streak is over and not claimed", () => {
            setStreaks(twoStreaks);
            setNow("2026-06-15T10:00:00Z");
            setCompletedGroups([ DAY_1 ]);

            const store = useStreakRewards();

            expect(store.isStreakOver).toBe(true);
            expect(store.widgetState).toBe(StreakWidgetState.Lost);
        });

        it("Claimed takes priority once the winner group is assigned", () => {
            setNow("2026-06-11T10:00:00Z");
            setCompletedGroups([ ...DAY_GROUPS, WINNER_GROUP ]);

            const store = useStreakRewards();

            expect(store.hasClaimedReward).toBe(true);
            expect(store.widgetState).toBe(StreakWidgetState.Claimed);
        });

        it("Guest takes priority and hides days / timer when not logged in", () => {
            setStreaks(twoStreaks);
            setNow("2026-06-08T10:00:00Z");
            setCompletedGroups([ DAY_1 ]);
            setLogged(false);

            const store = useStreakRewards();

            expect(store.widgetState).toBe(StreakWidgetState.Guest);
            expect(store.showDays).toBe(false);
            expect(store.showTimer).toBe(false);
        });
    });

    describe("days / timer visibility", () => {
        it("shows days and hides timer during an active streak", () => {
            setStreaks(twoStreaks);
            setNow("2026-06-08T10:00:00Z");

            const store = useStreakRewards();

            expect(store.showDays).toBe(true);
            expect(store.showTimer).toBe(false);
        });

        it("hides days and shows timer once the streak is over with a next streak", () => {
            setStreaks(twoStreaks);
            setNow("2026-06-15T10:00:00Z");

            const store = useStreakRewards();

            expect(store.showDays).toBe(false);
            expect(store.showTimer).toBe(true);
            expect(store.nextStreak?.winnerGroup).toBe(NEXT_WINNER_GROUP);
        });

        it("hides the timer when the active streak is the last one", () => {
            setNow("2026-06-15T10:00:00Z");

            const store = useStreakRewards();

            expect(store.isStreakOver).toBe(true);
            expect(store.nextStreak).toBeNull();
            expect(store.showTimer).toBe(false);
        });
    });
});
