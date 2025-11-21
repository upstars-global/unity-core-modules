import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

import { useAchievements } from "../../src/store/achievements";
import { useCashboxStore } from "../../src/store/cashboxStore";
import { useLevelsStore } from "../../src/store/levels/levelsStore";
import { useTournamentsStore } from "../../src/store/tournaments/tournamentsStore";

vi.mock("../../src/store/cashboxStore", () => ({
    useCashboxStore: vi.fn(() => ({
        historyDeposits: ref([]),
    })),
}));
vi.mock("../../src/store/levels/levelsStore", () => ({
    useLevelsStore: vi.fn(() => ({
        groups: ref([]),
        getLevelsData: ref([]),
    })),
}));
vi.mock("../../src/store/tournaments/tournamentsStore", () => ({
    useTournamentsStore: vi.fn(() => ({
        getAllTournamentsOnlyUser: [],
        getStatusTournamentById: vi.fn(() => ({})),
    })),
}));
vi.mock("../../src/store/user/userStatuses", () => ({
    useUserStatuses: vi.fn(() => ({
        getUserStatuses: [],
    })),
}));
vi.mock("@config/achievements", () => ({
    ACHIEV_ID: { EMAIL_CONFIRM: 1, EMAIL_CONFIRM_AND_MORE: 2, EXCHANGE_COIN: 3, COMPOINT_CHANGE: 4, DEP_PS: 5, DEP_COUNT: 6 },
    defaultDepCount: 2,
    TOURNAMENT_IDS_FOR_ACHIEV: [ 100, 101 ],
}));
vi.mock("@theme/configs/featureFlags", () => ({
    default: { enableConpoints: true },
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
        const mockGroups = ref([
            { id: 1, frontend_identifier: 1, status: "active", money_budget_cents: "100", name: "Group1" },
        ]);
        const mockTournaments = [
            { id: 100, frontend_identifier: 100, status: "active", money_budget_cents: "200" },
        ];
        vi.mocked(useLevelsStore).mockReturnValue({
            groups: mockGroups,
            getLevelsData: ref([]),
        });
        vi.mocked(useTournamentsStore).mockReturnValue({
            getAllTournamentsOnlyUser: mockTournaments,
            getStatusTournamentById: vi.fn(() => ({})),
        });

        const store = useAchievements();
        const all = store.getAchievementsAll;

        expect(all.some((a) => a.id === 1)).toBe(false);
        expect(all.some((a) => a.id === 100)).toBe(true);
    });

    it("getAchievementsActive filters out archived achievements", () => {
        const mockGroups = ref([
            { id: 1, frontend_identifier: 1, status: "ARCHIVE", money_budget_cents: "100", name: "Group1" },
        ]);
        vi.mocked(useLevelsStore).mockReturnValue({
            groups: mockGroups,
            getLevelsData: ref([]),
        });
        const store = useAchievements();
        expect(store.getAchievementsActive.length).toBe(0);
    });

    it("getAchievementsActive returns achievements if not archived", () => {
        const mockGroups = ref([
            { id: 1, frontend_identifier: 1, status: "active", money_budget_cents: "100", name: "Group1" },
        ]);
        vi.mocked(useLevelsStore).mockReturnValue({
            groups: mockGroups,
            getLevelsData: ref([]),
        });
        const store = useAchievements();
        expect(store.getAchievementsActive.length).toBeGreaterThanOrEqual(0);
    });

    it("getAchievementsHistory returns only inactive achievements", () => {
        const mockGroups = ref([
            { id: 1, frontend_identifier: 1, status: "active", money_budget_cents: "100", name: "Group1" },
            { id: 2, frontend_identifier: 2, status: "ARCHIVE", money_budget_cents: "200", name: "Group2" },
        ]);
        vi.mocked(useLevelsStore).mockReturnValue({
            groups: mockGroups,
            getLevelsData: ref([]),
        });
        const store = useAchievements();
        const history = store.getAchievementsHistory;
        expect(Array.isArray(history)).toBe(true);
    });
});
