import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { reactive, ref } from "vue";

import { GiftState } from "../../src/services/api/DTO/gifts";
import { useGiftsStore } from "../../src/store/gifts";

vi.mock("@theme/configs/constantsFreshChat", () => ({ PROJECT: "mocked" }));

const userInfoMock = {
    can_issue_bonuses: true,
    deposit_bonus_code: null as string | null,
};
const userCurrency = ref("USD");
const userStatusesMock = {
    isMultiAccount: false,
    getUserGroups: [ 5, 8 ] as Array<number | string>,
};

vi.mock("../../src/store/user/userInfo", () => ({
    useUserInfo: () => reactive({
        getUserInfo: userInfoMock,
        getUserCurrency: userCurrency,
        getSubunitsToUnitsByCode: () => 100,
    }),
}));

vi.mock("../../src/store/user/userStatuses", () => ({
    useUserStatuses: () => userStatusesMock,
}));

vi.mock("../../src/helpers/currencyHelper", () => ({
    currencyView: (amount: number) => amount / 100,
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
        userInfoMock.can_issue_bonuses = true;
        userInfoMock.deposit_bonus_code = null;
        userStatusesMock.isMultiAccount = false;
        userStatusesMock.getUserGroups = [ 5, 8 ];
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

    it("does not add additionalGift when user is not eligible", () => {
        const store = useGiftsStore();
        userInfoMock.can_issue_bonuses = false;

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

        expect(store.depositGifts.find((g) => g.id === "special")).toBeUndefined();
    });

    it("applies modifyGiftsConfig into giftsAll items", () => {
        const store = useGiftsStore();

        store.setGifts([ {
            id: 1,
            stage: GiftState.issued,
            title: "",
            amount_cents: 0,
            currency: "",
            strategy: "",
            amount_wager_cents: 0,
            amount_wager_requirement_cents: 0,
            created_at: "",
            activatable_until: null,
            valid_until: "",
            activatable: false,
            cancelable: false,
            type: "",
        } ]);

        store.setModifyGiftsConfig([ { group_keys: [ "1" ], title: "CMS" } as never ]);

        expect(store.giftsAll[0].cmsData).toEqual({ group_keys: [ "1" ], title: "CMS" });
    });

    it("applies modifyGiftsConfig by group_key", () => {
        const store = useGiftsStore();
        store.setGifts([ {
            id: 2,
            group_key: "group-2",
            stage: GiftState.issued,
            title: "",
            amount_cents: 0,
            currency: "",
            strategy: "",
            amount_wager_cents: 0,
            amount_wager_requirement_cents: 0,
            created_at: "",
            activatable_until: null,
            valid_until: "",
            activatable: false,
            cancelable: false,
            type: "",
        } as never ]);

        store.setModifyGiftsConfig([ { group_keys: [ "group-2" ], title: "CMS-2" } as never ]);

        expect(store.giftsAll[0].cmsData).toEqual({ group_keys: [ "group-2" ], title: "CMS-2" });
    });

    it("computes activeDepositGiftMinDep for normal and lootbox bonuses", () => {
        const store = useGiftsStore();

        store.setActiveDepositGift(null);
        expect(store.activeDepositGiftMinDep).toBe(0);

        store.setActiveDepositGift({
            id: "gift-1",
            title: "Gift",
            bonuses: [ {
                title: "",
                type: "normal",
                conditions: [ {
                    field: "amount",
                    type: "min",
                    value: [ { currency: "USD", amount_cents: 5000 } ],
                } ],
                attributes: [],
                result_bonus: [],
            } ],
        } as never);

        expect(store.activeDepositGiftMinDep).toBe(50);

        store.setActiveDepositGift({
            id: "gift-2",
            title: "Lootbox",
            bonuses: [ {
                title: "",
                type: "random",
                boxes: [ {
                    bonuses: [ {
                        conditions: [ {
                            field: "amount",
                            type: "min",
                            value: [ { currency: "USD", amount_cents: 7000 } ],
                        } ],
                    } ],
                } ],
                conditions: [],
                attributes: [],
                result_bonus: [],
            } ],
        } as never);

        expect(store.activeDepositGiftMinDep).toBe(70);
    });

    it("returns null activeDepositGiftGroupID when no active gift", () => {
        const store = useGiftsStore();
        store.setActiveDepositGift(null);
        expect(store.activeDepositGiftGroupID).toBeNull();
    });

    it("returns activeDepositGiftGroupID when active gift is set", () => {
        const store = useGiftsStore();
        store.setActiveDepositGift({
            id: "gift-group",
            title: "Group Gift",
            bonuses: [ {
                title: "",
                type: "normal",
                conditions: [ { field: "groups", type: "in", value: [ "pick:10" ] } ],
                attributes: [],
                result_bonus: [],
            } ],
        } as never);

        expect(store.activeDepositGiftGroupID).toBe("pick:10");
    });

    it("returns 0 when min deposit condition is missing", () => {
        const store = useGiftsStore();
        store.setActiveDepositGift({
            id: "gift-3",
            title: "Gift 3",
            bonuses: [ { title: "", type: "normal", conditions: [], attributes: [], result_bonus: [] } ],
        } as never);

        expect(store.activeDepositGiftMinDep).toBe(0);
    });

    it("computes giftMatchInUserGroup and ids", () => {
        const store = useGiftsStore();
        userStatusesMock.getUserGroups = [ "pick:5" ];

        store.setDepositGiftsAll([
            {
                id: "d1",
                title: "Dep 1",
                bonuses: [ {
                    title: "",
                    type: "normal",
                    conditions: [ { field: "groups", type: "in", value: [ "pick:5" ] } ],
                    attributes: [],
                    result_bonus: [],
                } ],
            },
        ] as never);

        expect(store.giftMatchInUserGroup?.id).toBe("d1");
        expect(store.giftMatchInUserGroupID).toBe("pick:5");
    });

    it("returns null giftMatchInUserGroupID when no match", () => {
        const store = useGiftsStore();
        userStatusesMock.getUserGroups = [];

        store.setDepositGiftsAll([
            {
                id: "d2",
                title: "Dep 2",
                bonuses: [ {
                    title: "",
                    type: "normal",
                    conditions: [ { field: "groups", type: "in", value: [ "pick:5" ] } ],
                    attributes: [],
                    result_bonus: [],
                } ],
            },
        ] as never);

        expect(store.giftMatchInUserGroupID).toBeNull();
    });

    it("returns null giftMatchInUserGroupID when condition has no pick group", () => {
        const store = useGiftsStore();
        userStatusesMock.getUserGroups = [ "pick:5" ];

        store.setDepositGiftsAll([
            {
                id: "d3",
                title: "Dep 3",
                bonuses: [ {
                    title: "",
                    type: "normal",
                    conditions: [ { field: "groups", type: "in", value: [ "group:5" ] } ],
                    attributes: [],
                    result_bonus: [],
                } ],
            },
        ] as never);

        expect(store.giftMatchInUserGroupID).toBeNull();
    });

    it("clears gifts store state", () => {
        const store = useGiftsStore();
        store.setGifts([ { id: 1 } ] as never);
        store.setDepositGiftsAll([ { id: "d1" } ] as never);
        store.setRegistrationGiftsAll([ { id: "r1" } ] as never);
        store.setFSGiftsAll([ { id: 1 } ] as never);

        store.giftsStoreClear();

        expect(store.gifts).toEqual([]);
        expect(store.depositGiftsAll).toEqual([]);
        expect(store.registrationGiftsAll).toEqual([]);
        expect(store.fsGiftsAll).toEqual([]);
    });

    it("updates misc flags and configs", () => {
        const store = useGiftsStore();
        store.setDisabledBonuses([ "bonus1" ]);
        store.setGiftsLoading(true);
        store.setDailyBonusConfig({ daily: { id: 1 } } as never);

        expect(store.disabledBonuses).toEqual([ "bonus1" ]);
        expect(store.isLoadingGiftData).toBe(true);
        expect(store.dailyBonusConfig).toEqual({ daily: { id: 1 } });
    });
});
