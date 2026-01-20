import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

import { useGameCurrent } from "../../../src/store/games/gameCurrent";

vi.mock("@theme/configs/constantsFreshChat", () => ({
    PROJECT: "project",
}));

vi.mock("../../../src/store/configStore", () => ({
    useConfigStore: () => ({
        gamesPageLimit: ref(20),
        $defaultProjectConfig: {
            PROJECT: "project",
            SPECIAL_GAME_PROVIDER_NAME: "special_provider",
            featureFlags:{
                enableAllProviders: true,
            },
            ENABLE_CURRENCIES:[ "USD" ],
        },
    }),
}));

describe("store/games/gameCurrent", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it("should currentGame be undefined on init", () => {
        const game = useGameCurrent();
        expect(game.currentGame).toBeUndefined();
    });

    it("should clear currentGame", () => {
        const game = useGameCurrent();
        game.clearCurrentGame();
        expect(game.currentGame).toBeNull();
    });
});
