import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as questHelpers from "../../src/helpers/questHelpers";
import { createUnityConfigPlugin } from "../../src/plugins/ConfigPlugin";
import type { UnityConfig } from "../../types/configProjectTypes";
import { baseUnityConfig } from "../mocks/unityConfig";

const mockLevels = {
    1: { bets: { USD: 10, EUR: 8 } },
    2: { bets: { USD: 20, EUR: 16 } },
    3: { bets: { USD: 30, EUR: 24 } },
};

const getQuestConfigMock = vi.fn(() => ({ mockLevels }));

describe("questHelpers", () => {
    beforeEach(() => {
        const config = {
            ...baseUnityConfig,
            getQuestConfig: getQuestConfigMock,
        } satisfies UnityConfig;

        const pinia = createPinia();
        pinia.use(createUnityConfigPlugin(config));
        setActivePinia(pinia);

        getQuestConfigMock.mockReturnValue({ mockLevels });
    });

    describe("isQuest", () => {
        it("returns true if 'quest' is in the string", () => {
            expect(questHelpers.isQuest("abc--quest--xyz")).toBe(true);
        });

        it("returns false if 'quest' is not in the string", () => {
            expect(questHelpers.isQuest("abc--test--xyz")).toBe(false);
        });
    });

    describe("questSlugById", () => {
        it("returns the slug part from the frontendId", () => {
            expect(questHelpers.questSlugById("foo--bar--slug")).toBe("slug");
        });

        it("returns undefined if not enough parts", () => {
            expect(questHelpers.questSlugById("foo--bar")).toBe(undefined);
        });
    });

    describe("questSizeById", () => {
        it("returns the size part from the frontendId", () => {
            expect(questHelpers.questSizeById("foo--size--slug")).toBe("size");
        });

        it("returns undefined if not enough parts", () => {
            expect(questHelpers.questSizeById("foo--bar")).toBe("bar");
        });
    });

    describe("getCurrentLevelData", () => {
        it("returns empty array if all params are falsy", () => {
            expect(questHelpers.getCurrentLevelData(undefined, undefined, undefined)).toEqual([]);
        });

        it("returns the correct level for userBets within a level", () => {
            expect(questHelpers.getCurrentLevelData("any", "USD", 15)).toEqual([
                "1",
                mockLevels["1"],
            ]);
        });

        it("returns the last level if userBets exceeds all", () => {
            expect(questHelpers.getCurrentLevelData("any", "USD", 35)).toEqual([
                "3",
                mockLevels["3"],
            ]);
        });

        it("returns empty array if no level matches", () => {
            getQuestConfigMock.mockImplementation(() => ({ mockLevels: {} }));
            expect(questHelpers.getCurrentLevelData("any", "USD", 5)).toEqual([]);
        });
    });

    describe("findNextLevelData", () => {
        it("returns empty array if all params are falsy", () => {
            expect(questHelpers.findNextLevelData(undefined, undefined, undefined, undefined)).toEqual([]);
        });

        it("returns the next level data if exists", () => {
            const currentLevelData = mockLevels["1"];
            expect(questHelpers.findNextLevelData("any", currentLevelData, "USD", 5)).toEqual([
                "1",
                mockLevels["1"],
            ]);
        });

        it("returns empty array if no next level", () => {
            const currentLevelData = mockLevels["3"];

            expect(questHelpers.findNextLevelData("any", currentLevelData, "USD", 29)).toEqual([]);
        });
    });
});
