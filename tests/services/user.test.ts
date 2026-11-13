import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { computed, reactive, ref } from "vue";

import type { IPlayerFieldsInfo } from "../../src/models/common";
import { EnumFormFields } from "../../src/models/common";
import * as playerRequests from "../../src/services/api/requests/player";
import { updateLocale } from "../../src/services/localization";
import {
    checkUserState,
    loadPlayerFieldsInfo,
    loadUserProfile,
    requestGdprReport,
    sendFreshChatRestoreId,
} from "../../src/services/user";
import { useUserSecurity } from "../../src/store/user/userSecurity";

const changeUserToGroupMock = vi.fn();
const useUserInfoMock = {
    addUserGroup: vi.fn(),
    removeUserGroup: vi.fn(),
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
    useUserInfo: vi.fn(() => reactive({
        info: { id: userInfoRef.value.id },
        getUserInfo: userInfoRef,
        getFreshChatRestoreIdLoaded: freshchatRestoreIdLoaded,
        getFreshChatRestoreId: freshchatRestoreId,
        ...useUserInfoMock,
    })),
}));

vi.mock("../../src/store/user/userStatuses", () => ({
    useUserStatuses: vi.fn(() =>
        reactive({
            getUserGroups: computed(() => userGroups),
            changeUserToGroup: changeUserToGroupMock,
        }),
    ),
}));

const playerFieldsInfo = ref<IPlayerFieldsInfo | undefined>(undefined);
const projectInfo = ref<{ gdpr_report_enabled?: boolean }>({ gdpr_report_enabled: true });
const setPlayerFieldsInfoMock = vi.fn((data: IPlayerFieldsInfo) => {
    playerFieldsInfo.value = data;
});
const getFieldsTypeMock = vi.fn();

vi.mock("../../src/store/common", () => ({
    useCommon: vi.fn(() => ({
        infoProject: projectInfo.value,
        get isGdprReportEnabled() {
            return projectInfo.value.gdpr_report_enabled === true;
        },
        playerFieldsInfo,
        setPlayerFieldsInfo: setPlayerFieldsInfoMock,
        getFieldsType: getFieldsTypeMock,
    })),
}));

vi.mock("../../src/services/api/requests/player", () => ({
    changePlayerGroup: vi.fn(),
    loadPlayerFieldsInfoRequest: vi.fn(),
    sendFreshChatRestoreIdReq: vi.fn(),
    sendUserDataReq: vi.fn(),
    loadUserProfileReq: vi.fn(),
    loadAvailableBonusesReq: vi.fn(),
    loadFreshChatRestoreIdReq: vi.fn(),
    requestGdprReportReq: vi.fn(),
}));

vi.mock("../../src/services/localization", () => ({
    updateLocale: vi.fn(),
}));

vi.mock("../../src/controllers/CustomerIO", () => ({
    cioIdentifyUser: vi.fn(),
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
        projectInfo.value = { gdpr_report_enabled: true };
        getFieldsTypeMock.mockReset();
        vi.mocked(playerRequests.loadPlayerFieldsInfoRequest).mockResolvedValue(undefined as unknown as IPlayerFieldsInfo);
        vi.mocked(playerRequests.sendUserDataReq).mockResolvedValue({ status: 200 } as never);
    });

    describe("requestGdprReport", () => {
        it.each([ {}, { gdpr_report_enabled: false } ])("skips disabled GDPR settings %j", async (settings) => {
            projectInfo.value = settings;

            await requestGdprReport();

            expect(playerRequests.requestGdprReportReq).not.toHaveBeenCalled();
            expect(useUserSecurity().gdprReport.status).toBe("idle");
        });

        it("stores a successful request and prevents another request", async () => {
            vi.mocked(playerRequests.requestGdprReportReq).mockResolvedValue(undefined);

            await requestGdprReport();

            expect(useUserSecurity().gdprReport.status).toBe("created");
            expect(useUserSecurity().isGdprReportRequested).toBe(true);
            await requestGdprReport();
            expect(playerRequests.requestGdprReportReq).toHaveBeenCalledExactlyOnceWith();
        });

        it("stores the restriction for an already requested report", async () => {
            const error = Object.assign(new Error("HTTP 422"), {
                response: { status: 422, data: { errors: { report: [ "already_exist" ] } } },
            });
            vi.mocked(playerRequests.requestGdprReportReq).mockRejectedValue(error);

            await requestGdprReport();

            expect(useUserSecurity().gdprReport.status).toBe("already_requested");
            expect(useUserSecurity().isGdprReportRequested).toBe(true);
            await requestGdprReport();
            expect(playerRequests.requestGdprReportReq).toHaveBeenCalledExactlyOnceWith();
        });

        it.each([
            Object.assign(new Error("HTTP 422"), {
                response: { status: 422, data: { errors: { report: [ "no_permissions" ] } } },
            }),
            Object.assign(new Error("HTTP 500"), {
                response: { status: 500, data: { errors: { report: [ "already_exist" ] } } },
            }),
            new Error("Network Error"),
        ])("stores other failures and allows retry", async (error) => {
            vi.mocked(playerRequests.requestGdprReportReq).mockRejectedValueOnce(error).mockResolvedValue(undefined);

            await requestGdprReport();

            expect(useUserSecurity().gdprReport.status).toBe("error");
            expect(useUserSecurity().isGdprReportRequested).toBe(false);
            await requestGdprReport();
            expect(useUserSecurity().gdprReport.status).toBe("created");
        });

        it("blocks concurrent calls and settles if the flag is disabled", async () => {
            let resolve!: () => void;
            vi.mocked(playerRequests.requestGdprReportReq).mockReturnValue(new Promise<void>((done) => { resolve = done; }));

            const request = requestGdprReport();
            await requestGdprReport();

            expect(useUserSecurity().isGdprReportLoading).toBe(true);
            expect(playerRequests.requestGdprReportReq).toHaveBeenCalledExactlyOnceWith();
            projectInfo.value = { gdpr_report_enabled: false };
            resolve();
            await request;
            expect(useUserSecurity().isGdprReportLoading).toBe(false);
            expect(useUserSecurity().gdprReport.status).toBe("created");
        });

        it.each([ "success", "error" ])("ignores an old %s after switching away and back to the same account", async (outcome) => {
            let resolve!: () => void;
            let reject!: (error: Error) => void;
            vi.mocked(playerRequests.requestGdprReportReq).mockReturnValueOnce(new Promise<void>((done, fail) => {
                resolve = done;
                reject = fail;
            })).mockResolvedValue(undefined);

            const oldRequest = requestGdprReport();
            userInfoRef.value = { ...defaultUser(), id: 3 };
            userInfoRef.value = defaultUser();
            await requestGdprReport();
            const currentState = useUserSecurity().gdprReport;

            if (outcome === "success") resolve();
            else reject(new Error("Network Error"));
            await oldRequest;

            expect(useUserSecurity().gdprReport).toBe(currentState);
            expect(useUserSecurity().gdprReport.status).toBe("created");
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

    describe("loadUserProfile", () => {
        const mockProfileLanguage = (language: string) => {
            vi.mocked(playerRequests.loadUserProfileReq).mockResolvedValue({
                data: { ...defaultUser(), language },
            } as never);
        };

        it("switches to the profile locale when it is available", async () => {
            mockProfileLanguage("en-IE");

            await loadUserProfile({ reload: true });

            expect(updateLocale).toHaveBeenCalledWith(expect.objectContaining({ lang: "en-IE" }));
            expect(useUserInfoMock.toggleUserIsLogged).toHaveBeenCalledWith(true);
        });

        it("keeps the current locale when the profile locale is not available", async () => {
            mockProfileLanguage("el");

            await loadUserProfile({ reload: true });

            expect(updateLocale).not.toHaveBeenCalled();
            expect(useUserInfoMock.toggleUserIsLogged).toHaveBeenCalledWith(true);
        });

        it("does not update the locale when the profile locale is already active", async () => {
            mockProfileLanguage("en");

            await loadUserProfile({ reload: true });

            expect(updateLocale).not.toHaveBeenCalled();
        });
    });
});
