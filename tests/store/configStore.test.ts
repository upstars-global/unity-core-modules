import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";

import { useConfigStore } from "../../src/store/configStore";

describe("useConfigStore", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it("initializes with default values", () => {
        const store = useConfigStore();

        expect(store.gamesPageLimit).toBe(40);
        expect(store.bettingConfig).toBeNull();
        expect(store.vipProgramConfig).toBeNull();
        expect(store.disabledGamesProviders).toEqual({});
    });

    it("updates simple configs via setters", () => {
        const store = useConfigStore();

        store.setGamesPageLimit(60);
        store.setBettingConfig({ allowed_bets: [ "one" ] } as never);
        store.setDisabledGamesProviders({ provider1: [ "game1" ] });

        expect(store.gamesPageLimit).toBe(60);
        expect(store.bettingConfig).toEqual({ allowed_bets: [ "one" ] });
        expect(store.disabledGamesProviders).toEqual({ provider1: [ "game1" ] });
    });

    it("maps vip program config from DTO format", () => {
        const store = useConfigStore();

        store.setVipProgramConfig({
            levelRewards: {
                level_1: [ "r1", "missing" ],
            },
            levelBonusesCount: { level_1: 2 },
            levelCards: { level_1: [ "card1" ] },
            levelsConfig: { level_1: { min: 0, max: 100 } },
            rewardCards: {
                r1: { title: "Reward 1" },
            },
            seasonInfo: { id: 1 },
        } as never);

        expect(store.vipProgramConfig).toMatchObject({
            rewards: {
                level_1: [ { title: "Reward 1", id: "r1" } ],
            },
            levelBonusesCount: { level_1: 2 },
            levelCards: { level_1: [ "card1" ] },
            levelsConfig: { level_1: { min: 0, max: 100 } },
            seasonInfo: { id: 1 },
        });
    });
});
