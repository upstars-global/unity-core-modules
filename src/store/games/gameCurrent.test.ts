import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";

import { useGameCurrent } from "./gameCurrent";

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
