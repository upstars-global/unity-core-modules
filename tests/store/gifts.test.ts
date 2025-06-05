import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GiftState } from "../../src/services/api/DTO/gifts";
import { useGiftsStore } from "../../src/store/gifts";

vi.mock("@theme/configs/constantsFreshChat", () => ({ PROJECT: "mocked" }));

vi.mock("../../src/store/user/userInfo", () => ({
    useUserInfo: () => ({
        getUserInfo: {
            can_issue_bonuses: true,
            deposit_bonus_code: null,
        },
    }),
}));

vi.mock("../../src/store/user/userStatuses", () => ({
    useUserStatuses: () => ({
        isMultiAccount: false,
        getUserGroups: [ 5, 8 ],
    }),
}));

vi.mock("@src/config/gift", () => ({
    LOOTBOX_TYPE_GIFTS: [ "random" ],
    STATUSES_GIFT_CANCELED: "canceled",
    STATUSES_GIFT_FINISHED: "finished",
    STATUSES_GIFT_EXPIRED: "expired",
    STATUSES_GIFT_WAGERDONE: "wager_done",
    STATUSES_GIFT_LOST: "lost",
    STATUSES_GIFT_HANDLEBETS: "handle_bets",
    STATUSES_GIFT_ISSUED: "issued",
    STATUSES_LOST_GIFT: [
        "finished",
        "canceled",
        "expired",
        "wager_done",
        "lost",
    ],
}));


describe("useGiftsStore", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it("sets gifts and filters actual and lost gifts correctly", () => {
        const store = useGiftsStore();

        store.setGifts([
            {
                id: 1, stage: GiftState.issued, title: "", amount_cents: 0, currency: "", strategy: "", amount_wager_cents: 0,
                amount_wager_requirement_cents: 0, created_at: "", activatable_until: null, valid_until: "",
                activatable: false, cancelable: false, type: "",
            },
            {
                id: 2, stage: GiftState.lost, title: "", amount_cents: 0, currency: "", strategy: "", amount_wager_cents: 0,
                amount_wager_requirement_cents: 0, created_at: "", activatable_until: null, valid_until: "",
                activatable: false, cancelable: false, type: "",
            },
        ]);

        expect(store.giftsActual).toHaveLength(1);
        expect(store.giftsLost).toHaveLength(1);
    });

    it("sets and filters free spin gifts", () => {
        const store = useGiftsStore();

        store.setFSGiftsAll([
            {
                id: 1,
                title: "FS 1",
                freespins_total: 10,
                freespins_performed: null,
                bet_level: 1,
                stage: GiftState.issued,
                games: [],
                games_info: [],
                activation_path: "",
                provider: "",
                currency: "",
                created_at: "",
                activatable_until: "",
                valid_until: null,
                activatable: true,
                activation_condition: null,
                cancelable: true,
                group_key: false,
                type: "",
            },
            {
                id: 2,
                title: "FS 2",
                freespins_total: 10,
                freespins_performed: null,
                bet_level: 1,
                stage: GiftState.expired,
                games: [],
                games_info: [],
                activation_path: "",
                provider: "",
                currency: "",
                created_at: "",
                activatable_until: "",
                valid_until: null,
                activatable: false,
                activation_condition: null,
                cancelable: true,
                group_key: false,
                type: "",
            },
        ]);

        expect(store.fsGifts).toHaveLength(1);
    });

    it("sets deposit gifts all and filters out lootbox types", () => {
        const store = useGiftsStore();

        store.setDepositGiftsAll([
            {
                id: "d1",
                title: "Dep 1",
                bonuses: [ { title: "", type: "normal", conditions: [], attributes: [], result_bonus: [] } ],
            },
            {
                id: "d2",
                title: "Dep 2",
                bonuses: [ { title: "", type: "random", conditions: [], attributes: [], result_bonus: [] } ],
            },
        ]);

        expect(store.depositGifts.length).toEqual(1);
        expect(store.depositGifts.some((g) => g.id === "d2")).toBe(false); // Excludes lootbox
    });

    it("computes total gift count and filters new/active gifts", () => {
        const store = useGiftsStore();

        const commonGift = {
            title: "",
            amount_cents: 0,
            currency: "",
            strategy: "",
            amount_wager_cents: 0,
            amount_wager_requirement_cents: 0,
            created_at: "",
            valid_until: "",
            cancelable: false,
            type: "",
            stage: GiftState.issued,
        };

        store.setGifts([
            { ...commonGift, id: 1, activatable: true, activatable_until: "2025-12-12" },
            { ...commonGift, id: 2, activatable: false, activatable_until: null, amount_wager_cents: 0 },
            { ...commonGift, id: 3, activatable: false, activatable_until: null, amount_wager_cents: 100 },
        ]);

        expect(store.giftsAll).toHaveLength(3);
        expect(store.giftsNew).toHaveLength(1);
        expect(store.giftsActive).toHaveLength(2);
        expect(store.giftsCounter).toBe(3);
    });

    it("computes additionalGift when matching user group exists", () => {
        const store = useGiftsStore();

        store.setAdditionalGifts({
            8: {
                id: "special",
                title: "Special Bonus",
                bonuses: [ {
                    title: "Bonus",
                    type: "normal",
                    conditions: [],
                    attributes: [],
                    result_bonus: [],
                } ],
            },
        });

        const result = store.depositGifts.find((g) => g.id === "special");
        expect(result).toBeDefined();
        expect(result?.title).toBe("Special Bonus");
    });
});
