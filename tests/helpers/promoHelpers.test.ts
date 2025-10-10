import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

import { promoFilterAndSettings, statusForTournament } from "../../src/helpers/promoHelpers";
import { type Currencies } from "../../src/models/enums/currencies";
import { PromoType, STATUS_PROMO } from "../../src/models/enums/tournaments";
import { type IQuestData } from "../../src/models/quest";
import { useBannerStore } from "../../src/store/banners";
import { useUserStatuses } from "../../src/store/user/userStatuses";

const baseTournament = {
    id: 1,
    title: "Test Tournament",
    in_progress: false,
    user_confirmation_required: false,
    group_ids: [],
    frontend_identifier: "test",
    strategy: "",
    currencies: "USD" as Currencies,
    game_category_identity: "",
    finished_at: "",
    description: "",
    prize: "",
    rules: "",
    leaderboard: [],
    min_bet: 0,
    max_bet: 0,
    min_deposit: 0,
    max_deposit: 0,
    min_win: 0,
    max_win: 0,
    min_turnover: 0,
    max_turnover: 0,
    min_games: 0,
    max_games: 0,
    currency: "",
    money_budget: "0",
    money_budget_cents: 0,
    chargeable_comp_points_budget: 0,
    chargeable_comp_points_budget_cents: 0,
    chargeable_money_budget: 0,
    chargeable_money_budget_cents: 0,
    chargeable_bonus_budget: 0,
    chargeable_bonus_budget_cents: 0,
    bonus_budget: 0,
    bonus_budget_cents: 0,
    persistent_comp_points_budget: 0,
    winner_team_id: 0,
    group_tournament: false,
    prizes: [],
    teams: [],
    team_id: null,
    team_name: "",
    team_icon: "",
    team_color: "",
    team_leaderboard: [],
    team_prizes: [],
    top_players: [],
    chargeable_comp_points_prize_pool: 0,
    persistent_comp_points_prize_pool: 0,
    money_prize_pool: "0",
    bonus_prize_pool: 0,
    chargeable_money_prize_pool: 0,
    money_prize_pool_cents: 0,
    games_taken_limit: 0,
};

vi.mock("../../src/store/banners", () => ({
    useBannerStore: vi.fn(),
}));

vi.mock("../../src/store/user/userStatuses", () => ({
    useUserStatuses: vi.fn(),
}));

const mockUserGroups = [ 123, 456 ];
const mockBanners = [
    { frontend_identifier: "promo1", image: "img1.jpg" },
    { frontend_identifier: "promo2", image: "img2.jpg" },
];

function getDate(offset: number) {
    return new Date(Date.now() + offset).toISOString();
}

beforeEach(() => {
    vi.resetAllMocks();
});

describe("promoFilterAndSettings", () => {
    it("returns empty array if promoList is empty", () => {
        const mockedUseBannerStore = vi.mocked(useBannerStore);
        const mockedUseUserStatuses = vi.mocked(useUserStatuses);

        mockedUseBannerStore.mockReturnValue({ banners: ref([]) });
        mockedUseUserStatuses.mockReturnValue({ getUserGroups: mockUserGroups });

        expect(promoFilterAndSettings([])).toEqual([]);
    });

    it("filters promos by user group", () => {
        const mockedUseBannerStore = vi.mocked(useBannerStore);
        const mockedUseUserStatuses = vi.mocked(useUserStatuses);

        mockedUseBannerStore.mockReturnValue({ banners: ref(mockBanners) });
        mockedUseUserStatuses.mockReturnValue({ getUserGroups: mockUserGroups });

        const promos = [
            {
                ...baseTournament,
                id: 1,
                group_ids: [ 123 ],
                frontend_identifier: "promo1",
                start_at: getDate(-1000),
                end_at: getDate(10000),
            },
            {
                ...baseTournament,
                id: 2,
                group_ids: [ 4561 ],
                frontend_identifier: "promo2",
                start_at: getDate(-1000),
                end_at: getDate(10000),
            },
            {
                ...baseTournament,
                id: 3,
                group_ids: [],
                frontend_identifier: "promo3",
                start_at: getDate(-1000),
                end_at: getDate(10000),
            },
        ];

        const result = promoFilterAndSettings(promos, PromoType.TOURNAMENT);

        expect(result.length).toBe(2);
        expect(result[0].id).toBe(1);
        expect(result[1].id).toBe(3);
    });

    it("maps banners and adds image and file fields", () => {
        const mockedUseBannerStore = vi.mocked(useBannerStore);
        const mockedUseUserStatuses = vi.mocked(useUserStatuses);

        mockedUseBannerStore.mockReturnValue({ banners: ref(mockBanners) });
        mockedUseUserStatuses.mockReturnValue({ getUserGroups: mockUserGroups });

        const promos = [
            {
                ...baseTournament,
                id: 1,
                group_ids: [ 123 ],
                frontend_identifier: "promo1",
                start_at: getDate(-1000),
                end_at: getDate(10000),
                questSize: "default",
                questSlug: "slug",
            },
        ];

        const result = promoFilterAndSettings<IQuestData>(promos, PromoType.TOURNAMENT);

        expect(result[0].image).toBe("img1.jpg");
        expect(result[0].file).toEqual(mockBanners[0]);
        expect(result[0].type).toBe(PromoType.TOURNAMENT);
        expect(result[0]).toHaveProperty("status");
    });

    it("sets image as undefined if banner has no image", () => {
        const mockedUseBannerStore = vi.mocked(useBannerStore);
        const mockedUseUserStatuses = vi.mocked(useUserStatuses);

        mockedUseBannerStore.mockReturnValue({ banners: ref([ { frontend_identifier: "promoX" } ]) });
        mockedUseUserStatuses.mockReturnValue({ getUserGroups: mockUserGroups });

        const promos = [
            {
                ...baseTournament,
                id: 1,
                group_ids: [ 123 ],
                frontend_identifier: "promoX",
                start_at: getDate(-1000),
                end_at: getDate(10000),
                questSize: "default",
                questSlug: "slug",
            },
        ];

        const result = promoFilterAndSettings<IQuestData>(promos, PromoType.TOURNAMENT);

        expect(result[0].image).toBeUndefined();
    });
});

describe("statusForTournament", () => {
    it("returns FUTURE if start_at is in the future", () => {
        const promo = {
            ...baseTournament,
            start_at: getDate(100000),
            end_at: getDate(200000),
        };

        expect(statusForTournament(promo)).toBe(STATUS_PROMO.FUTURE);
    });

    it("returns ACTIVE if started and not ended", () => {
        const promo = {
            ...baseTournament,
            start_at: getDate(-100000),
            end_at: getDate(100000),
        };

        expect(statusForTournament(promo)).toBe(STATUS_PROMO.ACTIVE);
    });

    it("returns ARCHIVE if ended", () => {
        const promo = {
            ...baseTournament,
            start_at: getDate(-200000),
            end_at: getDate(-100000),
        };

        expect(statusForTournament(promo)).toBe(STATUS_PROMO.ARCHIVE);
    });
});
