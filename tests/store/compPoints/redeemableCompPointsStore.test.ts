import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

import { CompPointRatesTypes, CompPointsTypes } from "../../../src/models/enums/compPoints";
import { Currencies } from "../../../src/models/enums/currencies";
import type { IRedeemableCards } from "../../../src/services/api/DTO/compPoints";
import { checkHasAvailableCards, useRedeemableCompPointsStore } from "../../../src/store/compPoints/redeemableCompPointsStore";

const mockCard = (overrides = {}): IRedeemableCards => ({
    type: CompPointRatesTypes.MONEY,
    rates: [ { currency: Currencies.EUR, points: 100, amount_cents: 0 } ],
    rate: { points: 100 },
    group: "default-group",
    title: "Default Title",
    games: [],
    ...overrides,
});

vi.mock("@router/routeNames", () => ({}));
vi.mock("@config/compPoints", () => ({
    CoinShopPageSlug: "test-slug",
}));
vi.mock("@theme/configs/meta", () => ({}));

vi.mock("../../../src/store/user/userInfo", () => ({
    useUserInfo: () => ({
        getIsLogged: ref(true),
        getUserCurrency: ref(Currencies.EUR),
    }),
}));
vi.mock("../../../src/store/compPoints/statusCompPointsStore", () => ({
    useStatusCompPointsStore: () => ({ getChargeableBalance: ref(200) }),
}));
vi.mock("../../../src/store/CMS", () => ({
    useCMS: () => ({
        currentStaticPage: ref({
            meta: {
                json: {
                    viewImages: { img: "url" },
                    promo: "promo",
                    gamesTitles: { game: "title" },
                    maxWin: { [Currencies.EUR]: 500 },
                    freeSpinsWager: { wager: 10 },
                    spinRate: { rate: 2 },
                    cards: { [CompPointsTypes.MONEY_REWARD]: [ mockCard() ] },
                },
            },
            slug: "rocket-mart",
        }),
    }),
}));

describe("checkHasAvailableCards", () => {
    it("returns false if not logged in", () => {
        expect(checkHasAvailableCards([ mockCard() ], false, 100, Currencies.EUR)).toBe(false);
    });
    it("returns false if no balance", () => {
        expect(checkHasAvailableCards([ mockCard() ], true, 0, Currencies.EUR)).toBe(false);
    });
    it("returns false if no cards", () => {
        expect(checkHasAvailableCards([], true, 100, Currencies.EUR)).toBe(false);
    });
    it("returns true if enough points for card", () => {
        expect(checkHasAvailableCards([ mockCard() ], true, 200, Currencies.EUR)).toBe(true);
    });
    it("returns false if not enough points for card", () => {
        expect(checkHasAvailableCards([ mockCard() ], true, 50, Currencies.EUR)).toBe(false);
    });
});

describe("useRedeemableCompPointsStore", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it("returns correct view images", () => {
        const store = useRedeemableCompPointsStore();
        expect(store.getViewImages).toEqual({ img: "url" });
    });
    it("returns correct promos", () => {
        const store = useRedeemableCompPointsStore();
        expect(store.getPromos).toBe("promo");
    });
    it("returns correct game titles", () => {
        const store = useRedeemableCompPointsStore();
        expect(store.getGameTitles).toEqual({ game: "title" });
    });
    it("returns correct max win string", () => {
        const store = useRedeemableCompPointsStore();
        expect(store.getMaxWin).toBe("500 EUR");
    });
    it("returns correct free spins wager", () => {
        const store = useRedeemableCompPointsStore();
        expect(store.getFreeSpinsWager).toEqual({ wager: 10 });
    });
    it("returns correct spin rate", () => {
        const store = useRedeemableCompPointsStore();
        expect(store.getSpinRate).toEqual({ rate: 2 });
    });
    it("returns correct mock cards", () => {
        const store = useRedeemableCompPointsStore();
        expect(store.getMockCards).toEqual({ [CompPointsTypes.MONEY_REWARD]: [ mockCard() ] });
    });
    it("setRates updates rates", () => {
        const store = useRedeemableCompPointsStore();
        store.setRates({
            [CompPointsTypes.MONEY_REWARD]: [
                mockCard({
                    rate: { points: 50 },
                    rates: [
                        {
                            currency: Currencies.EUR,
                            points: 50,
                            amount_cents: 0,
                        },
                    ],
                }),
            ],
        });

        const cards = store.rates[CompPointsTypes.MONEY_REWARD] as IRedeemableCards[];
        expect(cards[0].rate.points).toBe(50);
    });
    it("getRates returns rates if logged in", () => {
        const store = useRedeemableCompPointsStore();
        store.setRates({
            [CompPointsTypes.MONEY_REWARD]: [
                mockCard({
                    rate: { points: 77 },
                    rates: [
                        {
                            currency: Currencies.EUR,
                            points: 77,
                            amount_cents: 0,
                        },
                    ],
                }),
            ],
        });
        const rates = store.getRates?.[CompPointsTypes.MONEY_REWARD] as IRedeemableCards[] | undefined;
        expect(rates?.[0].rate.points).toBe(77);
    });
    it("getTabsAvailable returns correct flags", () => {
        const store = useRedeemableCompPointsStore();

        store.setRates({
            [CompPointsTypes.MONEY_REWARD]: [
                mockCard({
                    rate: { points: 100 },
                    rates: [
                        {
                            currency: Currencies.EUR,
                            points: 100,
                            amount_cents: 0,
                        },
                    ],
                }),
            ],
        });
        expect(store.getTabsAvailable[CompPointsTypes.MONEY_REWARD]).toBe(true);
    });
});
