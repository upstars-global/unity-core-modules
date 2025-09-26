import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PromoType } from "../../src/models/enums/tournaments";
import { useLotteriesStore } from "../../src/store/lotteries";

vi.mock("../../src/helpers/promoHelpers", () => ({
    promoFilterAndSettings: <T>(list: T[], type: PromoType) => list,
}));

describe("useLotteriesStore", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it("initializes with empty state", () => {
        const store = useLotteriesStore();
        expect(store.lotteriesStatuses).toEqual([]);
        expect(store.currentLottery).toBe(null);
        expect(store.getCommonTicketsBalance).toBe(0);
        expect(store.getLotteriesList).toEqual([]);
        expect(store.getActiveLotteryList).toEqual([]);
        expect(store.getCurrentLottery).toBe(null);
    });

    it("setLotteriesList updates lotteriesList and getLotteriesList", () => {
        const store = useLotteriesStore();
        const list = [
            { id: 1, in_progress: true },
            { id: 2, in_progress: false },
        ];

        // @ts-expect-error - different type
        store.setLotteriesList(list);
        expect(store.getLotteriesList).toEqual(list);
    });

    it("getActiveLotteryList filters only in_progress lotteries", () => {
        const store = useLotteriesStore();
        const list = [
            { id: 1, in_progress: true },
            { id: 2, in_progress: false },
        ];
        // @ts-expect-error - different type
        store.setLotteriesList(list);
        expect(store.getActiveLotteryList).toEqual([ { id: 1, in_progress: true } ]);
    });

    it("setLotteriesStatuses updates lotteriesStatuses and getCommonTicketsBalance", () => {
        const store = useLotteriesStore();
        const statuses = [
            { tickets: [ 1, 2, 3 ] },
            { tickets: [ 4 ] },
        ];

        // @ts-expect-error - different type
        store.setLotteriesStatuses(statuses);
        expect(store.lotteriesStatuses).toEqual(statuses);
        expect(store.getCommonTicketsBalance).toBe(4);
    });

    it("clearLotteriesUserData resets lotteriesStatuses", () => {
        const store = useLotteriesStore();

        // @ts-expect-error - different type
        store.setLotteriesStatuses([ { tickets: [ 1 ] } ]);
        store.clearLotteriesUserData();
        expect(store.lotteriesStatuses).toEqual([]);
    });

    it("getCurrentLottery returns filtered currentLottery", () => {
        const store = useLotteriesStore();

        // @ts-expect-error - different type
        store.currentLottery = { id: 5, in_progress: true };
        expect(store.getCurrentLottery).toEqual({ id: 5, in_progress: true });
        store.currentLottery = null;
        expect(store.getCurrentLottery).toBe(null);
    });
});
