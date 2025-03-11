import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useGameCurrent } from "../../../src/store/games/gameCurrent";

vi.mock("@theme/configs/constantsFreshChat", () => ({
    PROJECT: "project",
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
