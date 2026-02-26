
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { promoFilterAndSettings } from "../../src/helpers/promoHelpers";
import { questSizeById } from "../../src/helpers/questHelpers";
import { useQuestStore } from "../../src/store/quest/questStore";

const mockLevels = {
    1: {
        position: {
            left: 132,
            top: 151,
        },
        bets: {
            USD: 0,
        },
    },
    2: {
        position: {
            left: 50,
            top: 218,
        },
        bets: {
            USD: 150,
        },
    },
    3: {
        position: {
            left: 83,
            top: 311,
        },
        bets: {
            USD: 500,
        },
    },
};

vi.mock("@config/quest", () => ({
    default: vi.fn(() => ({ mockLevels })),
    DEFAULT_QUEST_SIZE: "default",
}));

vi.mock("../../src/helpers/promoHelpers", () => ({
    promoFilterAndSettings: vi.fn((items) => items),
}));

vi.mock("../../src/helpers/questHelpers", () => ({
    findNextLevelData: vi.fn(() => [ "next", { level: "next" } ]),
    getCurrentLevelData: vi.fn(() => [ "current", { level: "current" } ]),
    questSizeById: vi.fn((id: string) => id?.split("--")[1] || "default"),
    questSlugById: vi.fn((id: string) => id?.split("--").pop() || ""),
}));

describe("questStore", () => {
    setActivePinia(createPinia());
    let store = useQuestStore();

    beforeEach(() => {
        setActivePinia(createPinia());
        store = useQuestStore();
    });

    it("should initialize with default values", () => {
        expect(store.getQuestData).toBeDefined();
        expect(store.getCurrentUserBets).toBeDefined();
        expect(store.getQuestsList).toBeDefined();
    });

    it("setQuestsList should add quests with questSize and questSlug", () => {
        store.setQuestsList([
            { id: 1, frontend_identifier: "quest--1--slug", group_ids: [], currency: "USD" },
        ]);

        expect(store.getQuestsList.length).toBe(1);
        expect(store.getQuestsList[0].questSize).toBe("1");
        expect(store.getQuestsList[0].questSlug).toBe("slug");
    });

    it("setQuestsList falls back to default quest size", () => {
        vi.mocked(questSizeById).mockReturnValueOnce("");
        store.setQuestsList([
            { id: 10, frontend_identifier: "quest--size--slug", group_ids: [], currency: "USD" },
        ]);

        expect(store.getQuestsList[0].questSize).toBe("default");
    });

    it("setCurrentQuestFromList should set questData by slug", () => {
        store.setQuestsList([
            { id: 2, frontend_identifier: "slug-quest", group_ids: [ 5 ], currency: "USD" },
        ]);
        store.setCurrentQuestFromList("slug-quest");

        expect(store.getQuestData?.id).toBe(2);
    });

    it("setCurrentQuestFromList respects priorityId", () => {
        store.setQuestsList([
            { id: 20, frontend_identifier: "slug-quest", group_ids: [ 1 ], currency: "USD" },
            { id: 21, frontend_identifier: "slug-quest", group_ids: [ 2 ], currency: "USD" },
        ]);

        store.setCurrentQuestFromList("slug-quest", 2);
        expect(store.getQuestData?.id).toBe(21);
    });

    it("setCurrentQuestFromList ignores quest when priorityId does not match", () => {
        store.setQuestsList([
            { id: 30, frontend_identifier: "slug-quest", group_ids: [ 1 ], currency: "USD" },
        ]);

        store.setCurrentQuestFromList("slug-quest", 2);
        expect(store.getQuestData).toEqual({});
    });

    it("clearQuestUserData should reset userStatusQuest and currentUserQuestsStatuses", () => {
        store.setNewStatusesUserQuest([ { tournament_id: 1, bets: 10 } ]);
        store.clearQuestUserData();

        expect(store.getCurrentUserBets).toBe(0);
        expect(store.getUserBetsInQuestById(1)).toBeNull();
    });

    it("getPointsInQuestById should return levels for a quest", () => {
        store.setQuestsList([
            { id: 3, frontend_identifier: "test", group_ids: [], currency: "USD" },
        ])
        ;
        const points = store.getPointsInQuestById(3);

        expect(Array.isArray(points)).toBe(true);
        expect(points.length).toBeGreaterThan(0);
    });

    it("getPointsInQuestById returns empty array for unknown quest", () => {
        expect(store.getPointsInQuestById(999)).toEqual([]);
    });

    it("setNewStatusesUserQuest should update currentUserQuestsStatuses", () => {
        store.setNewStatusesUserQuest([ { tournament_id: 4, bets: 20 } ]);

        expect(store.getUserBetsInQuestById(4)).toBe(20);
    });

    it("getNextLevelPointByIdQuest should return next level data", () => {
        store.setQuestsList([
            { id: 5, frontend_identifier: "next", group_ids: [], currency: "USD" },
        ]);
        store.setNewStatusesUserQuest([ { tournament_id: 5, bets: 20 } ]);

        const next = store.getNextLevelPointByIdQuest(5);

        expect(next).toEqual([
            "next",
            { level: "next" },
        ]);

        store.setNewStatusesUserQuest([ { tournament_id: 5, bets: 220 } ]);

        const next2 = store.getNextLevelPointByIdQuest(5);

        expect(next2).toEqual([
            "next",
            { level: "next" },
        ]);
    });

    it("getNextLevelPointByIdQuest returns empty array when quest not found", () => {
        expect(store.getNextLevelPointByIdQuest(999)).toEqual([]);
    });

    it("updateStatusInQuest should update status for current quest", () => {
        store.setQuestsList([
            { id: 6, frontend_identifier: "update", group_ids: [], currency: "USD" },
        ]);
        store.setCurrentQuestFromList("update");
        store.updateStatusInQuest([ { tournament_id: 6, bets: 99 } ]);

        expect(store.getUserBetsInQuestById(6)).toBe(99);
    });

    it("computed helpers return defaults when questData is missing", () => {
        store.clearQuestUserData();
        expect(store.getQuestData).toBeNull();
        expect(store.getCurrentLevelPoint).toEqual([]);
        expect(store.getNextLevelPoint).toEqual([]);
    });

    it("getCurrentLevelPoint and getListQuestsLevelPoint use helper data", () => {
        store.setQuestsList([
            { id: 7, frontend_identifier: "quest--2--slug", group_ids: [], currency: "USD" },
        ]);
        store.setCurrentQuestFromList("quest--2--slug");
        store.setNewStatusesUserQuest([ { tournament_id: 7, bets: 10 } ]);

        expect(store.getCurrentLevelPoint).toEqual([ "current", { level: "current" } ]);
        expect(store.getListQuestsLevelPoint[7]).toEqual([ "current", { level: "current" } ]);
    });

    it("getListQuestsLevelPoint skips empty quest items", () => {
        vi.mocked(promoFilterAndSettings).mockReturnValueOnce([ undefined ] as never);
        expect(store.getListQuestsLevelPoint).toEqual({});
    });

    it("getCountLevelsCurrentQuest returns levels count for current quest", () => {
        store.setQuestsList([
            { id: 8, frontend_identifier: "quest--1--slug", group_ids: [], currency: "USD" },
        ]);
        store.setCurrentQuestFromList("quest--1--slug");

        expect(store.getCountLevelsCurrentQuest).toBe(Object.keys(mockLevels).length);
    });

    it("getNextLevelPoint returns data when quest is set", () => {
        store.setQuestsList([
            { id: 11, frontend_identifier: "quest--1--slug", group_ids: [], currency: "USD" },
        ]);
        store.setCurrentQuestFromList("quest--1--slug");
        expect(store.getNextLevelPoint).toEqual([ "next", { level: "next" } ]);
    });

    it("setQuestsList replaces quests with the same id", () => {
        store.setQuestsList([
            { id: 10, frontend_identifier: "quest--1--first", group_ids: [], currency: "USD" },
        ]);
        store.setQuestsList([
            { id: 10, frontend_identifier: "quest--2--second", group_ids: [], currency: "USD" },
        ]);

        expect(store.getQuestsList).toHaveLength(1);
        expect(store.getQuestsList[0].frontend_identifier).toBe("quest--2--second");
    });

    it("updateStatusInQuest is a no-op without current quest", () => {
        store.updateStatusInQuest([ { tournament_id: 9, bets: 20 } ]);
        expect(store.getUserBetsInQuestById(9)).toBeNull();
    });
});
