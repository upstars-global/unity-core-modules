import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useWinners } from "../../src/store/winners";

vi.mock("@helpers/gameImage", () => ({
    getGameImagePath: vi.fn().mockImplementation((id) => `/images/${id}.png`),
}));

const mockGet = vi.fn();

vi.mock("../../src/services/api/http", () => ({
    http: () => ({
        get: mockGet,
    }),
}));

describe("useWinners store", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        mockGet.mockReset();
    });

    it("loads winners and maps response correctly", async () => {
        mockGet.mockResolvedValueOnce({
            data: [
                {
                    at: 123,
                    bet_amount_cents: 100,
                    currency: "USD",
                    game_identifier: "provider/slot1",
                    game_table_image_path: "/img/slot1.png",
                    game_table_url: "/play/slot1",
                    game_title: "Slot 1",
                    humanized_win: "$10",
                    nickname: "winner1",
                    win_amount_cents: 1000,
                },
            ],
        });

        const store = useWinners();
        const winners = await store.loadWinners();

        expect(winners).toHaveLength(1);
        expect(winners[0]).toMatchObject({
            game: {
                has_demo_mode: false,
                image: "/images/provider/slot1.png",
                link: "play/slot1",
                slug: "slot1",
                title: "Slot 1",
            },
            id: "provider/slot1",
            sum: 1000,
            currency: "USD",
            user_id: "winner1",
            username: "winner1",
        });
    });

    it("returns cached winners if not reloading", async () => {
        mockGet.mockResolvedValueOnce({
            data: [
                {
                    at: 123,
                    bet_amount_cents: 100,
                    currency: "USD",
                    game_identifier: "provider/slot1",
                    game_table_image_path: "/img/slot1.png",
                    game_table_url: "/play/slot1",
                    game_title: "Slot 1",
                    humanized_win: "$10",
                    nickname: "winner1",
                    win_amount_cents: 1000,
                },
            ],
        });

        const store = useWinners();
        await store.loadWinners();

        const winners = await store.loadWinners();

        expect(mockGet).toHaveBeenCalledTimes(1);
        expect(winners).toHaveLength(1);
    });

    it("reloads winners if reload=true", async () => {
        mockGet.mockResolvedValue({
            data: [
                {
                    at: 123,
                    bet_amount_cents: 100,
                    currency: "USD",
                    game_identifier: "provider/slot2",
                    game_table_image_path: "/img/slot2.png",
                    game_table_url: "/play/slot2",
                    game_title: "Slot 2",
                    humanized_win: "$20",
                    nickname: "winner2",
                    win_amount_cents: 2000,
                },
            ],
        });

        const store = useWinners();
        await store.loadWinners();
        await store.loadWinners(true);

        expect(mockGet).toHaveBeenCalledTimes(2);
    });
});
