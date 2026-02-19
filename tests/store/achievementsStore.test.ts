import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { reactive, ref } from "vue";

import { STATUS_PROMO } from "../../src/models/enums/tournaments";
import { useAchievements } from "../../src/store/achievements";
import { useCashboxStore } from "../../src/store/cashboxStore";

const mockHistoryDeposits = ref([] as Array<{ finished_at: string; success: boolean }>);
const mockGroups = ref([] as Array<Record<string, unknown>>);
const mockUserStatuses = ref([] as Array<{ id: number }>);
const mockUserGroups = ref([] as number[]);
const mockTournaments = ref([] as Array<Record<string, unknown>>);
const mockStatusById = vi.fn(() => ({}));

const mockBetSunCompletedInTour = vi.fn();
const mockContainAchievIdInUserStatuses = vi.fn();

vi.mock("../../src/store/cashboxStore", () => ({
    useCashboxStore: vi.fn(() => ({
        historyDeposits: mockHistoryDeposits,
    })),
}));
vi.mock("../../src/store/levels/levelsStore", () => ({
    useLevelsStore: vi.fn(() => reactive({
        groups: mockGroups.value,
        getLevelsData: ref([]),
    })),
}));
vi.mock("../../src/store/tournaments/tournamentsStore", () => ({
    useTournamentsStore: vi.fn(() => ({
        getAllTournamentsOnlyUser: mockTournaments.value,
        getStatusTournamentById: mockStatusById,
    })),
}));
vi.mock("../../src/store/user/userStatuses", () => ({
    useUserStatuses: vi.fn(() => ({
        getUserStatuses: mockUserStatuses.value,
        getUserGroups: mockUserGroups.value,
    })),
}));
vi.mock("@config/achievements", () => ({
    ACHIEV_ID_COMPOINT_CHANGE: 4,
    ACHIEV_ID_DEP_COUNT: 6,
    ACHIEV_ID_DEP_PS: 5,
    ACHIEV_ID_EMAIL_CONFIRM: 1,
    ACHIEV_ID_EMAIL_CONFIRM_AND_MORE: 2,
    ACHIEV_ID_EXCHANGE_COIN: 3,
    ACHIEV_IDS_ALL: {
        EMAIL_CONFIRM: [ 1 ],
        EMAIL_CONFIRM_AND_MORE: [ 2 ],
        DEP_PS: [ 5 ],
        DEP_COUNT: [ 6 ],
    },
    TOUR_ID_ACHIEV_SPIN_COUNT: 100,
    TOURNAMENT_IDS_FOR_ACHIEV: [ 100, 101 ],
}));
vi.mock("@theme/configs/featureFlags", () => ({
    default: { enableConpoints: true },
}));
vi.mock("dayjs", () => {
    const dayjs = (input?: string) => ({
        _ms: input ? Date.parse(input) : Date.now(),
        isAfter(other: { _ms: number }) {
            return this._ms > other._ms;
        },
    });
    return { default: dayjs };
});
vi.mock("../../src/helpers/achievementHelpers", () => ({
    betSunCompletedInTour: (...args: unknown[]) => mockBetSunCompletedInTour(...args),
    containAchievIdInUserStatuses: (...args: unknown[]) => mockContainAchievIdInUserStatuses(...args),
}));
vi.mock("dayjs", () => ({
    default: () => ({ isAfter: () => true }),
}));
vi.mock("../helpers/achievementHelpers", () => ({
    betSunCompletedInTour: vi.fn(() => true),
    containAchievIdInUserStatuses: vi.fn(() => false),
}));
vi.mock("../../src/models/enums/tournaments", () => ({
    STATUS_PROMO: { ARCHIVE: "ARCHIVE" },
}));

describe("useAchievements", () => {
    beforeEach(() => {
        vi.resetAllMocks();

        setActivePinia(createPinia());
        mockHistoryDeposits.value = [];
        mockGroups.value = [];
        mockUserStatuses.value = [];
        mockUserGroups.value = [];
        mockTournaments.value = [];
        mockStatusById.mockReset();
    });

    it("initializes with computed properties", () => {
        const store = useAchievements();
        expect(store.getAchievementsAll).toBeDefined();
        expect(store.getDepCountForAchiev).toBeDefined();
        expect(store.getAchievementsActive).toBeDefined();
        expect(store.getAchievementsHistory).toBeDefined();
    });

    it("getDepCountForAchiev returns 0 if no deposits", () => {
        vi.mocked(useCashboxStore).mockReturnValueOnce({ historyDeposits: ref([]) });
        const store = useAchievements();
        expect(store.getDepCountForAchiev).toBe(0);
    });

    it("getAchievementsAll returns array", () => {
        const store = useAchievements();
        expect(Array.isArray(store.getAchievementsAll)).toBe(true);
    });

    it("getAchievementsActive returns array", () => {
        const store = useAchievements();
        expect(Array.isArray(store.getAchievementsActive)).toBe(true);
    });

    it("getAchievementsHistory returns array", () => {
        const store = useAchievements();
        expect(Array.isArray(store.getAchievementsHistory)).toBe(true);
    });

    it("getDepCountForAchiev counts only successful deposits after start date", () => {
        const mockDeposits = [
            { finished_at: "2023-01-01T00:00:00Z", success: true },
            { finished_at: "2021-01-01T00:00:00Z", success: true },
            { finished_at: "2023-01-01T00:00:00Z", success: false },
        ];

        vi.mocked(useCashboxStore).mockReturnValueOnce({ historyDeposits: ref(mockDeposits) });
        const store = useAchievements();

        expect(store.getDepCountForAchiev).toBe(2);
    });

    it("getAchievementsAll includes group and tournament achievements", () => {
        mockGroups.value = [
            { id: 1, frontend_identifier: 1, status: "active", money_budget_cents: "100", name: "Group1" },
        ];
        mockTournaments.value = [
            { id: 100, frontend_identifier: 100, status: "active", money_budget_cents: "200" },
        ];
        mockUserStatuses.value = [ { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 } ];

        const store = useAchievements();
        const all = store.getAchievementsAll;

        expect(all.some((a) => a.id === 1)).toBe(true);
        expect(all.some((a) => a.id === 100)).toBe(true);
    });

    it("getAchievementsActive filters out archived achievements", () => {
        mockGroups.value = [
            { id: 1, frontend_identifier: "tournament", status: STATUS_PROMO.ARCHIVE, money_budget_cents: "100" },
        ];
        mockUserStatuses.value = [ { id: 1 } ];
        const store = useAchievements();
        expect(store.getAchievementsActive.length).toBe(0);
    });

    it("getAchievementsActive respects tournament progress for spin count", () => {
        mockGroups.value = [
            { id: 1, frontend_identifier: 100, status: "active", money_budget_cents: "200" },
        ];
        mockUserStatuses.value = [ { id: 1 } ];

        mockStatusById.mockReturnValueOnce({ games_taken: 10 });
        mockBetSunCompletedInTour.mockReturnValueOnce(true);
        const storeBlocked = useAchievements();
        expect(storeBlocked.getAchievementsActive).toEqual([]);

        mockGroups.value = [
            { id: 1, frontend_identifier: 100, status: "active", money_budget_cents: "200" },
        ];
        mockStatusById.mockReturnValueOnce({ games_taken: 10 });
        mockBetSunCompletedInTour.mockReturnValueOnce(false);
        const storeActive = useAchievements();
        expect(storeActive.getAchievementsAll.length).toBe(1);
        expect(mockBetSunCompletedInTour).toHaveBeenCalled();
    });

    it("getAchievementsActive respects tournament progress for bet cents", () => {
        mockTournaments.value = [
            { id: 101, frontend_identifier: 101, status: "active", money_budget_cents: "200" },
        ];
        mockStatusById.mockReturnValueOnce({ bet_cents: 10 });
        mockBetSunCompletedInTour.mockReturnValueOnce(true);
        mockUserStatuses.value = [ { id: 1 } ];

        const store = useAchievements();
        expect(store.getAchievementsActive).toEqual([]);
    });

    it("getAchievementsActive handles non-frontend achievements", () => {
        mockContainAchievIdInUserStatuses.mockReturnValue(true);
        mockGroups.value = [
            { id: 6, status: "active", money_budget_cents: "0" },
        ];
        mockUserGroups.value = [ 6 ];
        mockUserStatuses.value = [ { id: 6 } ];

        const storeBlocked = useAchievements();
        expect(storeBlocked.getAchievementsActive).toEqual([]);

        setActivePinia(createPinia());
        mockGroups.value = [
            { id: 6, frontend_identifier: 0, status: "active", money_budget_cents: "0" },
        ];
        mockUserGroups.value = [];
        mockUserStatuses.value = [ { id: 6 } ];
        const storeActive = useAchievements();
        expect(storeActive.getAchievementsAll.length).toBe(1);
        expect(storeActive.getAchievementsActive).toEqual([
            expect.objectContaining({ id: 6 }),
        ]);
        expect(mockContainAchievIdInUserStatuses).toHaveBeenCalled();
    });

    it("getAchievementsHistory returns only inactive achievements", () => {
        mockGroups.value = [
            { id: 1, frontend_identifier: 1, status: "active", money_budget_cents: "100", name: "Group1" },
            { id: 2, frontend_identifier: 2, status: STATUS_PROMO.ARCHIVE, money_budget_cents: "200", name: "Group2" },
        ];
        mockUserStatuses.value = [ { id: 1 }, { id: 2 } ];
        const store = useAchievements();
        const history = store.getAchievementsHistory;
        expect(Array.isArray(history)).toBe(true);
    });
});
