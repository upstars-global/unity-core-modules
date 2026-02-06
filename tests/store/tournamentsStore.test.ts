import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

import { isAchievement } from "../../src/helpers/achievementHelpers";
import { isQuest } from "../../src/helpers/questHelpers";
import { Currencies } from "../../src/models/enums/currencies";
import { PromoType } from "../../src/models/enums/tournaments";
import type { ISnippetItemCMS } from "../../src/services/api/DTO/CMS";
import type { IPlayer, ITournament } from "../../src/services/api/DTO/tournamentsDTO";
import { useTournamentsStore } from "../../src/store/tournaments/tournamentsStore";

const mockSnippets = ref<ISnippetItemCMS[]>([]);
const mockBanners = ref<Array<{ frontend_identifier: string; image?: string }>>([]);
const mockParseJson = vi.fn();
const mockStatusForTournament = vi.fn(() => "mock-status");
const mockLogError = vi.fn();

vi.mock("../../src/store/CMS", () => ({
    useCMS: () => ({
        snippets: mockSnippets,
    }),
}));

vi.mock("../../src/store/banners", () => ({
    useBannerStore: () => ({
        banners: mockBanners,
    }),
}));

vi.mock("../../src/helpers/questHelpers", () => ({
    isQuest: vi.fn(),
}));

vi.mock("../../src/helpers/achievementHelpers", () => ({
    isAchievement: vi.fn(),
}));

vi.mock("../../src/helpers/parseJson", () => ({
    parseJson: (...args: unknown[]) => mockParseJson(...args),
}));

vi.mock("../../src/helpers/promoHelpers", () => ({
    promoFilterAndSettings: <T>(list: T[], type: PromoType) => list,
    statusForTournament: (...args: unknown[]) => mockStatusForTournament(...args),
}));

vi.mock("../../src/controllers/Logger", () => ({
    log: {
        error: (...args: unknown[]) => mockLogError(...args),
    },
}));

const baseTournament: ITournament = {
    id: 1,
    title: "Test Tournament",
    in_progress: false,
    user_confirmation_required: false,
    frontend_identifier: "tournament-1",
    strategy: "default",
    currencies: Currencies.USD,
    game_category_identity: "slots",
    start_at: new Date().toISOString(),
    end_at: new Date().toISOString(),
    finished_at: null,
    currency: "USD",
    money_budget: "0",
    money_budget_cents: 0,
    chargeable_comp_points_budget: 0,
    persistent_comp_points_budget: 0,
    winner_team_id: 0,
    group_tournament: false,
    prizes: [],
    top_players: [],
    chargeable_comp_points_prize_pool: 0,
    persistent_comp_points_prize_pool: 0,
    money_prize_pool: "0",
    money_prize_pool_cents: 0,
    games_taken_limit: 0,
    group_ids: [],
};

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

function makeTournament(overrides: Partial<ITournament>): ITournament {
    return {
        ...baseTournament,
        ...overrides,
    };
}

describe("useTournamentsStore", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        mockSnippets.value = [];
        mockBanners.value = [];
        mockParseJson.mockReset();
        mockStatusForTournament.mockClear();
        mockLogError.mockClear();
        vi.mocked(isQuest).mockReturnValue(false);
        vi.mocked(isAchievement).mockReturnValue(false);
    });

    it("initializes with default state", () => {
        const store = useTournamentsStore();
        expect(store.currentTournament).toBe(null);
        expect(store.currentUserTournamentsStatuses).toEqual([]);
        expect(store.recentTournaments).toEqual([]);
        expect(store.tournamentsList).toEqual([]);
        expect(store.userTournaments).toEqual([]);
        expect(store.getTournamentsList).toEqual([]);
        expect(store.getCustomTournamentsList).toEqual([]);
        expect(store.getActiveTournamentsList).toEqual([]);
    });

    it("getTournamentsList filters quests and achievements", () => {
        const store = useTournamentsStore();
        vi.mocked(isQuest).mockImplementation((id) => String(id).includes("quest"));
        vi.mocked(isAchievement).mockImplementation((id) => String(id).includes("achievement"));

        const list = [
            makeTournament({ id: 1, frontend_identifier: "quest-1" }),
            makeTournament({ id: 2, frontend_identifier: "achievement-1" }),
            makeTournament({ id: 3, frontend_identifier: "tournament-1" }),
        ];

        store.setTournamentsList(list);
        expect(store.getTournamentsList).toEqual([ makeTournament({ id: 3, frontend_identifier: "tournament-1" }) ]);
    });

    it("getCustomTournamentsList maps snippets into custom tournaments", () => {
        const store = useTournamentsStore();
        mockParseJson.mockImplementation((content: string) => JSON.parse(content));
        mockSnippets.value = [
            {
                categories: [ "tournament" ],
                id: "snippet-1",
                content: JSON.stringify(makeTournament({ id: 1, frontend_identifier: "custom-1" })),
            },
            {
                categories: [ "promo" ],
                id: "snippet-2",
                content: JSON.stringify(makeTournament({ id: 2, frontend_identifier: "custom-2" })),
            },
        ];

        const result = store.getCustomTournamentsList;
        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
            id: 1,
            frontend_identifier: "custom-1",
            custom: true,
            status: "mock-status",
            type: PromoType.TOURNAMENT,
        });
    });

    it("getCustomTournamentsList returns empty list and logs on parse error", () => {
        const store = useTournamentsStore();
        mockParseJson.mockImplementation(() => {
            throw new Error("bad json");
        });
        mockSnippets.value = [
            {
                categories: [ "tournament" ],
                id: "snippet-1",
                content: "{bad",
            },
        ];

        expect(store.getCustomTournamentsList).toEqual([]);
        expect(mockLogError).toHaveBeenCalledTimes(1);
    });

    it("getAllTournamentsOnlyUser returns filtered list", () => {
        const store = useTournamentsStore();
        const list = [ makeTournament({ id: 1, frontend_identifier: "tournament-1" }) ];
        store.setTournamentsList(list);

        expect(store.getAllTournamentsOnlyUser).toEqual(list);
    });

    it("getActiveTournamentsList returns only in-progress tournaments", () => {
        const store = useTournamentsStore();
        store.setTournamentsList([
            makeTournament({ id: 1, in_progress: true }),
            makeTournament({ id: 2, in_progress: false }),
        ]);

        expect(store.getActiveTournamentsList).toEqual([ makeTournament({ id: 1, in_progress: true }) ]);
    });

    it("getCurrentTournament enriches current tournament with status and banner", () => {
        const store = useTournamentsStore();
        mockBanners.value = [ { frontend_identifier: "tour-1", image: "img-1" } ];

        store.setCurrentTournament({ id: 1, frontend_identifier: "tour-1" });

        expect(store.getCurrentTournament).toMatchObject({
            id: 1,
            frontend_identifier: "tour-1",
            status: "mock-status",
            type: PromoType.TOURNAMENT,
            file: { frontend_identifier: "tour-1", image: "img-1" },
        });
    });

    it("getCurrentTournament returns empty object when no current tournament", () => {
        const store = useTournamentsStore();
        store.setCurrentTournament({ id: 1 });
        expect(store.getCurrentTournament).toEqual({});
    });

    it("getTournamentBySlug returns tournament from list or custom list", () => {
        const store = useTournamentsStore();
        mockParseJson.mockImplementation((content: string) => JSON.parse(content));
        mockSnippets.value = [
            {
                categories: [ "tournament" ],
                id: "snippet-2",
                content: JSON.stringify(makeTournament({ id: 2, frontend_identifier: "custom-2" })),
            },
        ];

        store.setTournamentsList([ makeTournament({ id: 1, frontend_identifier: "tournament-1" }) ]);

        expect(store.getTournamentBySlug(1)).toMatchObject({ id: 1 });
        expect(store.getTournamentBySlug(2)).toMatchObject({ id: 2, custom: true });
    });

    it("getTournamentBySlug returns empty object when not found", () => {
        const store = useTournamentsStore();
        store.setTournamentsList([ makeTournament({ id: 1, frontend_identifier: "tournament-1" }) ]);

        expect(store.getTournamentBySlug(999)).toEqual({});
    });

    it("getTournamentById returns undefined when not found", () => {
        const store = useTournamentsStore();
        store.setTournamentsList([ makeTournament({ id: 1 }) ]);
        expect(store.getTournamentById(2)).toBeUndefined();
    });

    it("getUserTournamentById and getStatusTournamentById work with stored statuses", () => {
        const store = useTournamentsStore();
        store.setTournamentsList([ makeTournament({ id: 1 }) ]);
        store.setCurrentUserTournamentsStatuses([ { tournament_id: 1 } as never ]);

        expect(store.getUserTournamentById(1)?.id).toBe(1);
        expect(store.getStatusTournamentById(1)?.tournament_id).toBe(1);
    });

    it("getRecentTournaments maps status and type", () => {
        const store = useTournamentsStore();
        store.setCurrentTournament({ frontend_identifier: "12" });

        const listForImage = makeTournament({ id: 12, frontend_identifier: "tour-12" });
        store.setTournamentsList([ listForImage, makeTournament({ id: 55, frontend_identifier: "tour-55" }) ]);
        store.setRecentTournaments([ makeTournament({ id: 5, frontend_identifier: "recent-1" }) ]);

        expect(store.getRecentTournaments).toEqual([
            {
                ...makeTournament({ id: 5, frontend_identifier: "recent-1" }),
                status: "mock-status",
                type: PromoType.TOURNAMENT,
                image: undefined,
                file: [ listForImage ],
            },
        ]);
    });

    it("updateUserTournament updates a top player status", () => {
        const store = useTournamentsStore();
        const initialPlayer = { ...basePlayer, nickname: "u1", award_place: 1, points: 5 };
        store.setUserTournaments([ makeTournament({ id: 1, top_players: [ initialPlayer ] }) ]);

        const newStatus = { ...basePlayer, nickname: "u1", award_place: 1, points: 10 };
        store.updateUserTournament(0, 0, newStatus);

        expect(store.userTournaments[0].top_players[0]).toEqual(newStatus);
    });

    it("reloadTournaments and clearTournamentUserData reset store data", () => {
        const store = useTournamentsStore();
        store.setCurrentTournament({ id: 1, frontend_identifier: "tour-1" });
        store.setCurrentUserTournamentsStatuses([ { tournament_id: 1 } as never ]);
        store.setUserTournaments([ makeTournament({ id: 1 }) ]);
        store.setTournamentsList([ makeTournament({ id: 1 }) ]);

        store.reloadTournaments();
        expect(store.currentTournament).toBeNull();

        store.clearTournamentUserData();
        expect(store.currentUserTournamentsStatuses).toEqual([]);
        expect(store.userTournaments).toEqual([]);
        expect(store.tournamentsList).toEqual([]);
    });
});
