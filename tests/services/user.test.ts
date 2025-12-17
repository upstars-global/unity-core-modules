import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

import type { IPlayerFieldsInfo } from "../../src/models/common";
import { EnumFormFields } from "../../src/models/common";
import * as playerRequests from "../../src/services/api/requests/player";
import {
    checkUserState,
    loadPlayerFieldsInfo,
    sendFreshChatRestoreId,
    userSetToGroupForAbTest,
} from "../../src/services/user";

vi.mock("@config/groupAB", () => ({
    ID_GROUP_FOR_PAIRED_ID: 100,
    ID_GROUP_FOR_UNPAIRED_ID: 101,
}));

const changeUserToGroupMock = vi.fn();
const useUserInfoMock = {
    setFreshChatRestoreId: vi.fn((id: string) => {
        freshchatRestoreId.value = id;
    }),
    setFreshChatRestoreIdLoaded: vi.fn((status: boolean = true) => {
        freshchatRestoreIdLoaded.value = status;
    }),
    updateUserInfo: vi.fn(),
    toggleUserIsLogged: vi.fn(),
    setUserData: vi.fn(),
    setUserInfoSavedFlag: vi.fn(),
};

const defaultUser = () => ({
    id: 2,
    user_id: "user-1",
    state: null as string | null,
    postal_code: "H1A1A1",
    country: "CA",
});

const userInfoRef = ref(defaultUser());
const freshchatRestoreIdLoaded = ref(true);
const freshchatRestoreId = ref("");
let userGroups: number[] = [];

vi.mock("../../src/store/user/userInfo", () => ({
    useUserInfo: vi.fn(() => ({
        info: { id: userInfoRef.value.id },
        getUserInfo: userInfoRef,
        getFreshChatRestoreIdLoaded: freshchatRestoreIdLoaded,
        getFreshChatRestoreId: freshchatRestoreId,
        ...useUserInfoMock,
    })),
}));

vi.mock("../../src/store/user/userStatuses", () => ({
    useUserStatuses: vi.fn(() => ({
        getUserGroups: userGroups,
        changeUserToGroup: changeUserToGroupMock,
    })),
}));

const playerFieldsInfo = ref<IPlayerFieldsInfo | undefined>(undefined);
const setPlayerFieldsInfoMock = vi.fn((data: IPlayerFieldsInfo) => {
    playerFieldsInfo.value = data;
});
const getFieldsTypeMock = vi.fn();

vi.mock("../../src/store/common", () => ({
    useCommon: vi.fn(() => ({
        playerFieldsInfo,
        setPlayerFieldsInfo: setPlayerFieldsInfoMock,
        getFieldsType: getFieldsTypeMock,
    })),
}));

vi.mock("../../src/services/api/requests/player", () => ({
    loadPlayerFieldsInfoRequest: vi.fn(),
    sendFreshChatRestoreIdReq: vi.fn(),
    sendUserDataReq: vi.fn(),
    loadUserProfileReq: vi.fn(),
}));

vi.mock("../../src/controllers/Logger", () => ({
    log: { error: vi.fn() },
}));

vi.mock("@theme/configs/stateFieldConfig", () => ({
    getStateByCounty: vi.fn(() => "QC"),
}));

describe("user service helpers", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
        userGroups = [];
        userInfoRef.value = defaultUser();
        freshchatRestoreIdLoaded.value = true;
        freshchatRestoreId.value = "";
        playerFieldsInfo.value = undefined;
        getFieldsTypeMock.mockReset();
        vi.mocked(playerRequests.loadPlayerFieldsInfoRequest).mockResolvedValue(undefined as unknown as IPlayerFieldsInfo);
        vi.mocked(playerRequests.sendUserDataReq).mockResolvedValue({ status: 200 } as never);
    });

    describe("userSetToGroupForAbTest", () => {
        it("does nothing when user already in AB group", async () => {
            userGroups = [ 100 ];

            await userSetToGroupForAbTest();

            expect(changeUserToGroupMock).not.toHaveBeenCalled();
        });

        it("assigns paired group for even user id", async () => {
            userInfoRef.value = { ...userInfoRef.value, id: 4 };

            await userSetToGroupForAbTest();

            expect(changeUserToGroupMock).toHaveBeenCalledWith(100);
        });

        it("assigns unpaired group for odd user id", async () => {
            userInfoRef.value = { ...userInfoRef.value, id: 5 };

            await userSetToGroupForAbTest();

            expect(changeUserToGroupMock).toHaveBeenCalledWith(101);
        });
    });

    describe("loadPlayerFieldsInfo", () => {
        it("returns cached fields when already loaded and not reloading", async () => {
            const cached: IPlayerFieldsInfo = {
                fields: [],
                contexts: {} as IPlayerFieldsInfo["contexts"],
            };
            playerFieldsInfo.value = cached;

            const result = await loadPlayerFieldsInfo();

            expect(result).toStrictEqual(cached);
            expect(playerRequests.loadPlayerFieldsInfoRequest).not.toHaveBeenCalled();
        });

        it("fetches and stores fields when reload is true", async () => {
            const fetched: IPlayerFieldsInfo = {
                fields: [ { field: EnumFormFields.state, type: "text" } ],
                contexts: {} as IPlayerFieldsInfo["contexts"],
            };
            vi.mocked(playerRequests.loadPlayerFieldsInfoRequest).mockResolvedValue(fetched);

            await loadPlayerFieldsInfo({ reload: true });

            expect(playerRequests.loadPlayerFieldsInfoRequest).toHaveBeenCalled();
            expect(setPlayerFieldsInfoMock).toHaveBeenCalledWith(fetched);
            expect(playerFieldsInfo.value).toStrictEqual(fetched);
        });
    });

    describe("sendFreshChatRestoreId", () => {
        it("skips request when restore id not yet loaded", async () => {
            freshchatRestoreIdLoaded.value = false;

            await sendFreshChatRestoreId("RID", "project");

            expect(playerRequests.sendFreshChatRestoreIdReq).not.toHaveBeenCalled();
            expect(useUserInfoMock.setFreshChatRestoreId).not.toHaveBeenCalled();
        });

        it("updates restore id and sends request when allowed", async () => {
            freshchatRestoreIdLoaded.value = true;
            freshchatRestoreId.value = "old";

            await sendFreshChatRestoreId("NEW", "project");

            expect(useUserInfoMock.setFreshChatRestoreId).toHaveBeenCalledWith("NEW");
            expect(useUserInfoMock.setFreshChatRestoreIdLoaded).toHaveBeenCalled();
            expect(playerRequests.sendFreshChatRestoreIdReq).toHaveBeenCalledWith("user-1", "NEW", "project");
        });
    });

    describe("checkUserState", () => {
        it("sends state update when config exists and state is missing", async () => {
            getFieldsTypeMock.mockReturnValue({ field: EnumFormFields.state, type: "text" });
            userInfoRef.value = {
                ...userInfoRef.value,
                state: null,
                postal_code: "H1A1A1",
                country: "CA",
            };

            await checkUserState();

            expect(playerRequests.sendUserDataReq).toHaveBeenCalledWith({
                context: "edition",
                player: { state: "QC" },
            });
        });

        it("skips state update when config missing", async () => {
            getFieldsTypeMock.mockReturnValue(undefined);

            await checkUserState();

            expect(playerRequests.sendUserDataReq).not.toHaveBeenCalled();
        });
    });
});
