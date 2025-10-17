import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

import type { ICompPoints, IExchangeMoneyRate } from "../../../src/services/api/DTO/compPoints";
import { useStatusCompPointsStore } from "../../../src/store/compPoints/statusCompPointsStore";
import { useUserInfo } from "../../../src/store/user/userInfo";

type MockedUseUserInfo = typeof useUserInfo extends () => infer R ? R : never;

const mockCompPoints: ICompPoints = {
    chargeable: { points: 150 },
    persistent: { points: 75 },
};

const mockRates: IExchangeMoneyRate[] = [
    {
        group: "A",
        title: "Group A",
        wager: 10,
        rates: [
            { points: 100, currency: "EUR", amount_cents: 1000 },
            { points: 200, currency: "USD", amount_cents: 2000 },
        ],
    },
];

vi.mock("../../../src/store/user/userInfo", () => ({
    useUserInfo: vi.fn(),
}));

vi.mock("../../../src/store/common", () => ({
    useCommon: () => ({ getDefaultCurrency: ref("EUR") }),
}));

describe("useStatusCompPointsStore", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();

        vi.mocked(useUserInfo).mockReturnValue({
            getUserCurrency: ref("EUR"),
        } as MockedUseUserInfo);
    });

    it("returns undefined for getUserCompPoints when not set", () => {
        const store = useStatusCompPointsStore();
        expect(store.getUserCompPoints).toBeUndefined();
    });

    it("returns 0 for getChargeableBalance when not set", () => {
        const store = useStatusCompPointsStore();
        expect(store.getChargeableBalance).toBe(0);
    });

    it("returns 0 for getStatusBalance when not set", () => {
        const store = useStatusCompPointsStore();
        expect(store.getStatusBalance).toBe(0);
    });

    it("returns correct comp points after update", () => {
        const store = useStatusCompPointsStore();
        store.updateCompPoints(mockCompPoints);
        expect(store.getCompPoints).toEqual(mockCompPoints);
        expect(store.getUserCompPoints).toBe(150);
        expect(store.getChargeableBalance).toBe(150);
        expect(store.getStatusBalance).toBe(75);
    });

    it("setRatesMoney updates ratesMoney", () => {
        const store = useStatusCompPointsStore();
        store.setRatesMoney(mockRates);
        expect(store.getCompPointsRate).toEqual(mockRates[0].rates[0]);
    });

    it("getCompPointsRate returns correct rate for user currency", () => {
        const store = useStatusCompPointsStore();
        store.setRatesMoney(mockRates);
        expect(store.getCompPointsRate.currency).toBe("EUR");
    });

    it("getCompPointsRate returns default rate if user currency not found", () => {
        vi.mocked(useUserInfo).mockReturnValue({
            getUserCurrency: ref("GBP"),
        } as MockedUseUserInfo);

        const store = useStatusCompPointsStore();
        store.setRatesMoney(mockRates);
        expect(store.getCompPointsRate.currency).toBe("EUR");
    });

    it("getCompPointsRate returns empty object if no rates", () => {
        const store = useStatusCompPointsStore();
        store.setRatesMoney([]);
        expect(store.getCompPointsRate).toEqual({});
    });

    it("clearState resets compPoints to null", () => {
        const store = useStatusCompPointsStore();
        store.updateCompPoints(mockCompPoints);
        store.clearState();
        expect(store.getCompPoints).toBeNull();
    });
});
