import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";

import type { IJackpotWinner } from "../../src/models/winner";
import { useJackpotWinners } from "../../src/store/winnersJackpot";

const createWinner = (amount_cents: number, user_name: string): IJackpotWinner => ({
    amount_cents,
    user_name,
    jackpot_name: "Jackpot",
    jackpot_level_name: "Level 1",
    approved_at: "2024-01-01T00:00:00Z",
    created_at: "2024-01-01T00:00:00Z",
    jackpot_level_external_code: "level-1",
    jackpot_external_code: "jackpot-1",
    jackpot_original_currency: "USD",
    jackpot_original_amount_cents: amount_cents,
});

describe("useJackpotWinners store", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it("returns empty lists by default", () => {
        const store = useJackpotWinners();

        expect(store.sortLatestWinnersList).toEqual([]);
        expect(store.sortBiggestWinnersList).toEqual([]);
    });

    it("sets winners data and exposes latest list", () => {
        const store = useJackpotWinners();
        const winners = [
            createWinner(300, "user-a"),
            createWinner(500, "user-b"),
        ];

        store.setWinnersData(winners);

        expect(store.sortLatestWinnersList).toEqual(winners);
    });

    it("sorts biggest winners descending without changing latest order", () => {
        const store = useJackpotWinners();
        const winners = [
            createWinner(300, "user-a"),
            createWinner(500, "user-b"),
            createWinner(100, "user-c"),
        ];

        store.setWinnersData(winners);

        expect(store.sortBiggestWinnersList.map((item) => item.amount_cents)).toEqual([ 500, 300, 100 ]);
        expect(store.sortLatestWinnersList.map((item) => item.amount_cents)).toEqual([ 300, 500, 100 ]);
    });
});
