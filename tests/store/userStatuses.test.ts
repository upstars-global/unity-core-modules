import { VIP_CLUB_IDS } from "@config/vip-clubs";
import { getUserIsDiamond, getUserVipGroup } from "@helpers/user";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

import type { IUserStatus } from "../../src/models/user";
import { useLevelsStore } from "../../src/store/levels/levelsStore";
import { useUserInfo } from "../../src/store/user/userInfo";
import { useUserStatuses } from "../../src/store/user/userStatuses";

const ALL_LEVELS = [ 10, 20, 30 ];
const ID_CASHBOX_ONBOARD_DONE = 99;
const ID_GROUP_FOR_MULTI_ACC = 77;
const TEST_GROUP_ID = 11;

const mockUserInfo = ref<{ statuses: IUserStatus[] }>({
    statuses: [],
});
const mockGetLevelsById = vi.fn();

vi.mock("@config/user-statuses", () => ({
    ALL_LEVELS: [ 10, 20, 30 ],
    ID_CASHBOX_ONBOARD_DONE: 99,
    ID_GROUP_FOR_MULTI_ACC: 77,
    TEST_GROUP_ID: 11,
}));

vi.mock("@helpers/user", () => ({
    getUserVipGroup: vi.fn(),
    getUserIsDiamond: vi.fn(),
}));

vi.mock("../../src/store/levels/levelsStore", () => ({
    useLevelsStore: vi.fn(),
}));

vi.mock("../../src/store/user/userInfo", () => ({
    useUserInfo: vi.fn(),
}));

describe("useUserStatuses", () => {
    const mockedGetUserVipGroup = vi.mocked(getUserVipGroup);
    const mockedGetUserIsDiamond = vi.mocked(getUserIsDiamond);

    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
        mockUserInfo.value = { statuses: [] };
        mockGetLevelsById.mockReset();
        mockedGetUserVipGroup.mockReset();
        mockedGetUserIsDiamond.mockReset();

        vi.mocked(useUserInfo).mockReturnValue({ getUserInfo: mockUserInfo });
        vi.mocked(useLevelsStore).mockReturnValue({ getLevelsById: mockGetLevelsById });
    });

    it("returns default values when user has no statuses", () => {
        const store = useUserStatuses();

        expect(store.getUserStatuses).toEqual([]);
        expect(store.getUserGroups).toEqual([]);
        expect(store.isUserTester).toBe(false);
        expect(store.isMultiAccount).toBe(false);
        expect(store.isVip).toBe(false);
        expect(store.userVipStatus).toBeNull();
        expect(store.getUserLevelId).toBeUndefined();
        expect(store.getUserLevelInfo).toEqual({});
        expect(store.getUserManager).toBeNull();
        expect(store.isRegisteredViaSocialNetwork).toBe(false);
        expect(store.isCashboxOnboardDone).toBe(false);
    });

    it("maps user groups and detects tester and cashbox flags", () => {
        mockUserInfo.value = {
            statuses: [
                { id: TEST_GROUP_ID, name: "tester" },
                { id: ID_CASHBOX_ONBOARD_DONE, name: "cashbox" },
                { id: "vip_level_1", name: "vip" },
            ],
        };

        const store = useUserStatuses();

        expect(store.getUserGroups).toEqual([
            TEST_GROUP_ID,
            ID_CASHBOX_ONBOARD_DONE,
            "vip_level_1",
        ]);
        expect(store.isUserTester).toBe(true);
        expect(store.isCashboxOnboardDone).toBe(true);
    });

    it("detects multiaccount via setAvailableBonuses", () => {
        const store = useUserStatuses();

        expect(store.isMultiAccount).toBe(false);

        store.setAvailableBonuses(false);
        expect(store.isMultiAccount).toBe(true);

        store.setAvailableBonuses(true);
        expect(store.isMultiAccount).toBe(false);
    });

    it("returns level info for the first non-numeric status id", () => {
        const levelStatus: IUserStatus = { id: "level_200", name: "Level 200" };
        mockUserInfo.value = {
            statuses: [
                { id: 1, name: "number" },
                levelStatus,
            ],
        };
        mockGetLevelsById.mockReturnValue({ id: levelStatus.id });

        const store = useUserStatuses();

        expect(store.getUserLevelInfo).toEqual({ id: levelStatus.id });
        expect(mockGetLevelsById).toHaveBeenCalledWith(levelStatus.id);
    });

    it("derives vip data using helper functions", () => {
        const vipGroup = VIP_CLUB_IDS.GOLD;
        mockUserInfo.value = {
            statuses: [ { id: vipGroup, name: "Gold" } ],
        };
        mockedGetUserVipGroup.mockReturnValue(vipGroup);
        mockedGetUserIsDiamond.mockImplementation((group) => {
            return group === VIP_CLUB_IDS.DIAMOND;
        });

        const store = useUserStatuses();

        expect(store.userVipGroup).toBe(vipGroup);
        expect(mockedGetUserVipGroup).toHaveBeenCalledWith([ vipGroup ]);
        expect(store.isVip).toBe(true);
        expect(store.userVipStatus).toBe("Gold");
        expect(store.isDiamond).toBe(false);

        mockUserInfo.value = {
            statuses: [ { id: VIP_CLUB_IDS.DIAMOND, name: "Diamond" } ],
        };
        mockedGetUserVipGroup.mockReturnValue(VIP_CLUB_IDS.DIAMOND);
        expect(store.isDiamond).toBe(true);
    });

    it("finds user level id from available levels", () => {
        mockUserInfo.value = {
            statuses: [
                { id: ALL_LEVELS[1], name: "level" },
                { id: 999, name: "other" },
            ],
        };

        const store = useUserStatuses();

        expect(store.getUserLevelId).toBe(ALL_LEVELS[1]);
    });

    it("tracks social auth groups and user manager", () => {
        const manager = {
            groupId: "group",
            managerName: "Manager",
            telegramLink: "t.me/manager",
            whatsAppLink: "wa.me/manager",
            email: "manager@example.com",
            phone: "+123",
            time: "12:00",
            avatar: "avatar.png",
        };
        mockUserInfo.value = {
            statuses: [ { id: 55, name: "social" } ],
        };

        const store = useUserStatuses();

        store.setSocialNetworkAuthGroups([ 55 ]);
        expect(store.isRegisteredViaSocialNetwork).toBe(true);

        store.setUserManager(manager);
        expect(store.getUserManager).toEqual(manager);

        store.clearUserManager();
        expect(store.getUserManager).toBeNull();
    });
});
