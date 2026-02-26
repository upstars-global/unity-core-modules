import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useGameCurrent } from "../../../src/store/games/gameCurrent";

vi.mock("@theme/configs/constantsFreshChat", () => ({
    PROJECT: "project",
}));
vi.mock("@helpers/gameImage", () => ({
    getGameImagePath: vi.fn((id: string) => `/images/${id}.png`),
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

    it("setToCurrentGame sets preview when identifier is present", () => {
        const store = useGameCurrent();
        const payload = { identifier: "provider/game", title: "Game" };

        const result = store.setToCurrentGame(payload);

        expect(result).toEqual(payload);
        expect(store.currentGame).toMatchObject({
            identifier: "provider/game",
            preview: "/images/provider/game.png",
        });
    });

    it("setToCurrentGame returns input when identifier is missing", () => {
        const store = useGameCurrent();
        const payload = { title: "Game" };

        expect(store.setToCurrentGame(payload)).toEqual(payload);
        expect(store.currentGame).toBeUndefined();
    });
});
