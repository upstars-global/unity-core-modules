
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

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

    it("setCurrentQuestFromList should set questData by slug", () => {
        store.setQuestsList([
            { id: 2, frontend_identifier: "slug-quest", group_ids: [ 5 ], currency: "USD" },
        ]);
        store.setCurrentQuestFromList("slug-quest");

        expect(store.getQuestData?.id).toBe(2);
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
            "2",
            mockLevels["2"],
        ]);

        store.setNewStatusesUserQuest([ { tournament_id: 5, bets: 220 } ]);

        const next2 = store.getNextLevelPointByIdQuest(5);

        expect(next2).toEqual([
            "3",
            mockLevels["3"],
        ]);
    });

    it("updateStatusInQuest should update status for current quest", () => {
        store.setQuestsList([
            { id: 6, frontend_identifier: "update", group_ids: [], currency: "USD" },
        ]);
        store.setCurrentQuestFromList("update");
        store.updateStatusInQuest([ { tournament_id: 6, bets: 99 } ]);

        expect(store.getUserBetsInQuestById(6)).toBe(99);
    });
});
