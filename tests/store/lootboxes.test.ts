import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

import { EnumLootboxState } from "../../src/models/enums/lootboxes";
import { useLootboxesStore } from "../../src/store/lootboxes";

vi.mock("@helpers/lootBoxes", () => ({
    filterIssuedLootBoxes: vi.fn((list) =>
        list
            .filter(({ stage, group_key }) => stage === EnumLootboxState.issued && group_key.startsWith("wheel"))),
}));

vi.mock("../../src/store/user/userStatuses", () => ({
    useUserStatuses: () => ({
        getUserGroups: ref([ 1, 2 ]),
    }),
}));

vi.mock("../../src/store/CMS", () => ({
    useCMS: () => ({
        currentStaticPage: ref({ meta: { json: { rateInfo: { spins: 5 } } } }),
    }),
}));

describe("useLootboxesStore", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it("initializes with default values", () => {
        const store = useLootboxesStore();
        expect(store.lootboxesList).toEqual([]);
        expect(store.fakeIdPrizeWin).toBeUndefined();
        expect(store.pageContentByGroup).toBeUndefined();
        expect(store.mockSectionsWheelConfigs).toEqual([]);
        expect(store.mockSectionsWheelSegmentConfigs).toEqual({});
        expect(store.redeemableSpinInfo).toBeUndefined();
    });

    it("updateLootboxList adds new lootbox if not present", () => {
        const store = useLootboxesStore();
        const lootbox = { id: 1, stage: EnumLootboxState.issued, group_key: "wheel_1" };

        store.updateLootboxList({ data: lootbox });

        expect(store.lootboxesList).toContainEqual(lootbox);
    });

    it("updateLootboxList updates existing lootbox", () => {
        const store = useLootboxesStore();
        const lootbox = { id: 1, stage: EnumLootboxState.issued, group_key: "wheel_1" };
        const other = { id: 2, stage: EnumLootboxState.expired, group_key: "wheel_2" };
        store.lootboxesList = [ lootbox, other ];

        const updated = { id: 1, stage: EnumLootboxState.issued, group_key: "wheel_1" };

        store.updateLootboxList({ data: updated });
        expect(store.lootboxesList[0]).toEqual(updated);
        expect(store.lootboxesList[1]).toEqual(other);
    });

    it("clearLootboxesUserData resets lootboxesList", () => {
        const store = useLootboxesStore();
        store.lootboxesList = [ { id: 1, stage: EnumLootboxState.issued, group_key: "wheel_1" } ];
        store.clearLootboxesUserData();
        expect(store.lootboxesList).toEqual([]);
    });

    it("setMockSectionsWheelConfigs sets configs", () => {
        const store = useLootboxesStore();
        const configs = [ { id: "cfg" } ];
        store.setMockSectionsWheelConfigs(configs);
        expect(store.mockSectionsWheelConfigs).toEqual(configs);
    });

    it("setMockSectionsWheelSegmentConfigs sets segment configs", () => {
        const store = useLootboxesStore();
        const configs = { 1: [ { id: "cfg" } ] };
        store.setMockSectionsWheelSegmentConfigs(configs);
        expect(store.mockSectionsWheelSegmentConfigs).toEqual(configs);
    });

    it("setPageContentByGroup sets page content", () => {
        const store = useLootboxesStore();
        const content = { id: "page" };
        store.setPageContentByGroup(content);
        expect(store.pageContentByGroup).toEqual(content);
    });

    it("setRedeemableSpinInfo sets spin info", () => {
        const store = useLootboxesStore();
        const info = { spins: 10 };
        store.setRedeemableSpinInfo(info);
        expect(store.redeemableSpinInfo).toEqual(info);
    });

    it("lootboxListIssued returns issued lootboxes", () => {
        const store = useLootboxesStore();
        store.lootboxesList = [
            { id: 1, stage: EnumLootboxState.issued, group_key: "wheel_1" },
            { id: 2, stage: EnumLootboxState.expired, group_key: "wheel_2" },
        ];
        expect(store.lootboxListIssued).toEqual([ { id: 1, stage: EnumLootboxState.issued, group_key: "wheel_1" } ]);
    });

    it("countActiveLootbox returns correct count", () => {
        const store = useLootboxesStore();
        store.lootboxesList = [
            { id: 1, stage: EnumLootboxState.issued, group_key: "wheel_1" },
            { id: 2, stage: EnumLootboxState.issued, group_key: "wheel_2" },
            { id: 3, stage: EnumLootboxState.expired, group_key: "wheel_3" },
        ];
        expect(store.countActiveLootbox).toBe(2);
    });

    it("userGroupForWheel finds correct group", () => {
        const store = useLootboxesStore();
        store.mockSectionsWheelSegmentConfigs = { 1: [], 3: [] };
        expect(store.userGroupForWheel).toBe("1");
    });

    it("getMockSegmentWheelUser returns correct config for user group", () => {
        const store = useLootboxesStore();
        store.mockSectionsWheelSegmentConfigs = { 1: [ { id: "seg" } ] };

        expect(store.getMockSegmentWheelUser).toEqual([ { id: "seg" } ]);
    });

    it("getMockSegmentWheelUser returns empty array when no group matches", () => {
        const store = useLootboxesStore();
        store.mockSectionsWheelSegmentConfigs = { 3: [ { id: "seg" } ] };

        expect(store.getMockSegmentWheelUser).toEqual([]);
    });

    it("getRedeemableSpinInfo returns redeemableSpinInfo if set", () => {
        const store = useLootboxesStore();
        store.redeemableSpinInfo = { spins: 99 };
        expect(store.getRedeemableSpinInfo).toEqual({ spins: 99 });
    });

    it("getRedeemableSpinInfo falls back to currentStaticPage meta json rateInfo", () => {
        const store = useLootboxesStore();
        store.redeemableSpinInfo = undefined;

        expect(store.getRedeemableSpinInfo).toEqual({ spins: 5 });
    });
});
