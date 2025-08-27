import { describe, expect, it } from "vitest";

import { betSunCompletedInTour, containAchievIdInUserStatuses, isAchievement } from "../../src/helpers/achievementHelpers";

describe("achievementHelpers", () => {
    it("isAchievement detects substring", () => {
        expect(isAchievement("some-achievement-id")).toBe(true);
        expect(isAchievement("other")).toBe(false);
    });

    it("containAchievIdInUserStatuses finds by numeric match", () => {
        const list = [ { id: "1" }, { id: "2" } ];
        expect(containAchievIdInUserStatuses(list, 2)).toBe(true);
        expect(containAchievIdInUserStatuses(list, 3)).toBe(false);
    });

    it("betSunCompletedInTour compares ratio >= 1", () => {
        expect(betSunCompletedInTour(100, 100)).toBe(true);
        expect(betSunCompletedInTour(101, 100)).toBe(true);
        expect(betSunCompletedInTour(99, 100)).toBe(false);
    });
});
