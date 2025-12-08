import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";

import type { IUserGameHistoryItem } from "../../src/models/user";
import { userGamesHistory } from "../../src/store/user/userGamesHistory";

describe("userGamesHistory store", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it("initializes with empty history", () => {
        const store = userGamesHistory();

        expect(store.gamesHistory).toEqual([]);
    });

    it("setGamesHistory updates history array", () => {
        const store = userGamesHistory();
        const history: IUserGameHistoryItem[] = [
            {
                bet_id: 3226031092,
                bet_status: "finished",
                created_at: "2025-06-18T09:16:28.557Z",
                currency: "AUD",
                finished_at: "2025-06-18T09:16:46.567Z",
                game: "topgames/Crash",
                provider: "topgames",
                title: "Crash",
                total_bets: 100,
                total_losses: 100,
                total_wins: 0,
            },
        ];

        store.setGamesHistory(history);

        expect(store.gamesHistory).toEqual(history);
    });
});
