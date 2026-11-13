import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/services/api/requests/configs", () => ({
    loadDisabledBonusesConfigReq: vi.fn(),
}));
vi.mock("../../src/controllers/Logger", () => ({ log: { error: vi.fn() } }));
vi.mock("@theme/configs/constantsFreshChat", () => ({ PROJECT: "mocked" }));
vi.mock("../../src/services/api/requests/gifts", () => ({
    getPlayerBonusesReq: vi.fn(),
    getDepositBonusesReq: vi.fn(),
    getRegistrationBonusesReq: vi.fn(),
    getPlayerFreespinsReq: vi.fn(),
}));

vi.mock("@src/config/gift", () => ({
    TYPE_GIFT_BONUS: "bonus",
    TYPE_GIFT_DEPOSIT: "deposit",
    TYPE_GIFT_REGISTRATION: "registration",
    TYPE_GIFT_FS: "fs",
    STATUSES_GIFT_ISSUED: "issued",
}));

import * as configReqs from "../../src/services/api/requests/configs";
import * as giftReqs from "../../src/services/api/requests/gifts";
import {
    loadDepositGiftsData,
    loadFSGiftsData,
    loadGiftsData,
    loadRegistrationGiftsData,
} from "../../src/services/gifts";
import { useGiftsStore } from "../../src/store/gifts";

describe("Gifts service – mapping to store (selected functions)", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.mocked(configReqs.loadDisabledBonusesConfigReq).mockReset();
        vi.mocked(configReqs.loadDisabledBonusesConfigReq).mockResolvedValue({ group_keys: [] });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("loadGiftsData()", () => {
        it.each([ "bonuses", "config" ])("waits for both responses when %s arrives first", async (first) => {
            const store = useGiftsStore();
            const bonuses = [
                { id: 1, group_key: "bthd17", stage: "issued", activatable: true },
                { id: 2, group_key: "bthd17", stage: "activated", activatable: false },
                { id: 3, group_key: "other", stage: "issued", activatable: true },
            ];
            let resolveBonuses!: (value: typeof bonuses) => void;
            let resolveConfig!: (value: { group_keys: string[] }) => void;
            vi.mocked(giftReqs.getPlayerBonusesReq).mockReturnValueOnce(new Promise((resolve) => {
                resolveBonuses = resolve;
            }));
            vi.mocked(configReqs.loadDisabledBonusesConfigReq).mockReturnValueOnce(new Promise((resolve) => {
                resolveConfig = resolve;
            }));

            const loading = loadGiftsData();
            if (first === "bonuses") {
                resolveBonuses(bonuses);
            } else {
                resolveConfig({ group_keys: [ "bthd17" ] });
            }
            await Promise.resolve();
            await Promise.resolve();

            expect(store.gifts).toEqual([]);
            expect(store.isLoadingGiftData).toBe(true);

            if (first === "bonuses") {
                resolveConfig({ group_keys: [ "bthd17" ] });
            } else {
                resolveBonuses(bonuses);
            }
            await loading;

            expect(store.disabledBonuses).toEqual([ "bthd17" ]);
            expect(store.gifts.map((gift) => gift.id)).toEqual([ 2, 3 ]);
            expect(store.isLoadingGiftData).toBe(false);
        });

        it("applies the updated disabled bonuses config when gifts are reloaded", async() => {
            const store = useGiftsStore();
            vi.mocked(giftReqs.getPlayerBonusesReq).mockResolvedValue([
                { id: 1, group_key: "bthd17", stage: "issued", activatable: true },
            ]);

            await loadGiftsData();
            expect(store.gifts).toHaveLength(1);

            vi.mocked(configReqs.loadDisabledBonusesConfigReq).mockResolvedValue({ group_keys: [ "bthd17" ] });
            await loadGiftsData();

            expect(store.gifts).toEqual([]);
            expect(store.isLoadingGiftData).toBe(false);
        });

        it("clears the loading flag and keeps existing gifts when the bonuses request fails", async () => {
            const store = useGiftsStore();
            const previousGifts = store.gifts;
            const error = new Error("Bonuses request failed");
            vi.mocked(giftReqs.getPlayerBonusesReq).mockRejectedValueOnce(error);

            await expect(loadGiftsData()).rejects.toThrow(error);

            expect(store.gifts).toBe(previousGifts);
            expect(store.isLoadingGiftData).toBe(false);
        });

        it("adds type='bonus' to each IGift and filters out disabled 'issued' gifts", async () => {
            const store = useGiftsStore();

            vi.mocked(configReqs.loadDisabledBonusesConfigReq).mockResolvedValue({ group_keys: [ "grpX" ] });

            const rawBonuses = [
                {
                    id: 1,
                    title: "Gift A",
                    amount_cents: 1000,
                    currency: "USD",
                    stage: "issued",
                    strategy: "sA",
                    amount_wager_requirement_cents: 5000,
                    amount_wager_cents: 0,
                    created_at: "2025-01-01T00:00:00Z",
                    activatable_until: null,
                    valid_until: "2025-12-31T23:59:59Z",
                    activatable: true,
                    cancelable: true,
                    type: "",
                    group_key: "grpX",
                },
                {
                    id: 2,
                    title: "Gift B",
                    amount_cents: 2000,
                    currency: "EUR",
                    stage: "activated",
                    strategy: "sB",
                    amount_wager_requirement_cents: 10000,
                    amount_wager_cents: 0,
                    created_at: "2025-02-02T00:00:00Z",
                    activatable_until: "2025-03-01T00:00:00Z",
                    valid_until: "2025-11-30T23:59:59Z",
                    activatable: false,
                    cancelable: false,
                    type: "",
                    group_key: "grpY",
                },
            ];
            vi.spyOn(giftReqs, "getPlayerBonusesReq").mockResolvedValue(rawBonuses);

            const returned = await loadGiftsData();

            expect(returned).toHaveLength(2);
            expect(returned[0]).toMatchObject({ id: 1, type: "bonus" });
            expect(returned[1]).toMatchObject({ id: 2, type: "bonus" });

            expect(store.gifts).toHaveLength(1);
            expect(store.gifts[0]).toMatchObject({ id: 2, type: "bonus" });

            expect(store.isLoadingGiftData).toBe(false);
        });

        it("when disabledBonuses is empty, saves all with type='bonus'", async () => {
            const store = useGiftsStore();

            store.disabledBonuses = [];

            const raw = [
                {
                    id: 3,
                    title: "Gift C",
                    amount_cents: 3000,
                    currency: "GBP",
                    stage: "issued",
                    strategy: "sC",
                    amount_wager_requirement_cents: 15000,
                    amount_wager_cents: 0,
                    created_at: "2025-03-03T00:00:00Z",
                    activatable_until: null,
                    valid_until: "2025-10-31T23:59:59Z",
                    activatable: true,
                    cancelable: true,
                    type: "",
                    group_key: "grpZ",
                },
            ];
            vi.spyOn(giftReqs, "getPlayerBonusesReq").mockResolvedValue(raw);

            await loadGiftsData();

            expect(store.gifts).toHaveLength(1);
            expect(store.gifts[0]).toMatchObject({ id: 3, type: "bonus" });
        });
    });

    describe("loadDepositGiftsData()", () => {
        it("adds type='deposit' & title=bonuses[0].title to each IGiftDeposit", async () => {
            const store = useGiftsStore();

            const rawDeposit = [
                {
                    id: "d1",
                    bonuses: [
                        {
                            title: "Dep Bonus 1",
                            type: "x",
                            conditions: [],
                            attributes: [],
                            result_bonus: [],
                        },
                    ],
                    group_key: "g1",
                },
                {
                    id: "d2",
                    bonuses: [
                        {
                            title: "Dep Bonus 2",
                            type: "y",
                            conditions: [],
                            attributes: [],
                            result_bonus: [],
                        },
                    ],
                },
            ];
            vi.spyOn(giftReqs, "getDepositBonusesReq").mockResolvedValue(rawDeposit);

            await loadDepositGiftsData();

            expect(store.depositGiftsAll).toHaveLength(2);

            expect(store.depositGiftsAll[0]).toMatchObject({
                id: "d1",
                type: "deposit",
                title: "Dep Bonus 1",
                group_key: "g1",
            });
            expect(store.depositGiftsAll[1]).toMatchObject({
                id: "d2",
                type: "deposit",
                title: "Dep Bonus 2",
            });
        });
    });

    describe("loadRegistrationGiftsData()", () => {
        it("adds type='registration' & title=bonuses[0].title to each IGiftDeposit", async () => {
            const store = useGiftsStore();

            const rawReg = [
                {
                    id: "r1",
                    bonuses: [
                        {
                            title: "Reg Bonus 1",
                            type: "t",
                            conditions: [],
                            attributes: [],
                            result_bonus: [],
                        },
                    ],
                },
            ];
            vi.spyOn(giftReqs, "getRegistrationBonusesReq").mockResolvedValue(rawReg);

            await loadRegistrationGiftsData();

            expect(store.registrationGiftsAll).toHaveLength(1);
            expect(store.registrationGiftsAll[0]).toMatchObject({
                id: "r1",
                type: "registration",
                title: "Reg Bonus 1",
            });
        });
    });

    describe("loadFSGiftsData()", () => {
        it("adds type='fs' to each IGiftFreeSpins and keeps title", async () => {
            const store = useGiftsStore();

            const rawFS = [
                {
                    id: 5,
                    title: "FS Gift",
                    freespins_total: 8,
                    freespins_performed: null,
                    bet_level: 2,
                    stage: "issued",
                    games: [ "slot1" ],
                    games_info: [],
                    activation_path: "/p",
                    provider: "prov",
                    currency: "USD",
                    created_at: "2025-04-04T00:00:00Z",
                    activatable_until: "2025-05-05T00:00:00Z",
                    valid_until: null,
                    activatable: true,
                    activation_condition: null,
                    cancelable: true,
                    group_key: "gk1",
                    type: "",
                },
            ];
            vi.spyOn(giftReqs, "getPlayerFreespinsReq").mockResolvedValue(rawFS);

            await loadFSGiftsData();

            expect(store.fsGiftsAll).toHaveLength(1);
            expect(store.fsGiftsAll[0]).toMatchObject({
                id: 5,
                type: "fs",
                title: "FS Gift",
            });
        });
    });
});
