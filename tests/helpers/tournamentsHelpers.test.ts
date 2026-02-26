import { describe, expect, it } from "vitest";

import { sanitizeUserTourStatuses } from "../../src/helpers/tournaments";
import type { IPlayer } from "../../src/services/api/DTO/tournamentsDTO";

const basePlayer: IPlayer = {
    tournament_id: 1,
    tournament_team_id: 0,
    nickname: "user",
    user_confirmed: true,
    bets: "0",
    bet_cents: 0,
    wins: "0",
    win_cents: 0,
    rate: 0,
    games_taken: 0,
    award_place: 1,
    award_place_in_team: 1,
    points: 0,
};

function makePlayer(overrides: Partial<IPlayer>): IPlayer {
    return {
        ...basePlayer,
        ...overrides,
    };
}

describe("tournaments helpers", () => {
    describe("sanitizeUserTourStatuses", () => {
        it("keeps old statuses not present in new list and appends new statuses", () => {
            const existing = [
                makePlayer({ tournament_id: 1, nickname: "old-1" }),
                makePlayer({ tournament_id: 2, nickname: "old-2" }),
            ];
            const incoming = [
                makePlayer({ tournament_id: 2, nickname: "new-2" }),
                makePlayer({ tournament_id: 3, nickname: "new-3" }),
            ];

            const result = sanitizeUserTourStatuses(existing, incoming);

            expect(result).toEqual([
                makePlayer({ tournament_id: 1, nickname: "old-1" }),
                makePlayer({ tournament_id: 2, nickname: "new-2" }),
                makePlayer({ tournament_id: 3, nickname: "new-3" }),
            ]);
        });
    });
});
