import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { reactive, ref } from "vue";

import { useFreshChatStore } from "../../src/store/freshChat";
import { useUserInfo } from "../../src/store/user/userInfo";

vi.mock("@theme/configs/config", () => ({
    default: {
        freshChat: {
            token: "token",
            widgetUuid: "widgetUuid",
        },
    },
}));
vi.mock("../../src/store/user/userInfo", () => ({
    useUserInfo: vi.fn(),
}));

describe("store/freshChat", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it("should initialize with default values", () => {
        expect(useFreshChatStore().getMessagesCount).toBe(0);
    });

    it("should set the newMessagesCount state correctly", () => {
        const store = useFreshChatStore();

        store.setNewMessageCount(5);
        expect(store.getMessagesCount).toBe(5);
    });

    it("should set the userData state to null if there is no user id", () => {
        useUserInfo.mockReturnValue({
            getUserInfo: ref({
                id: null,
                mobile_phone: "mobile_phone",
                email: "email",
                first_name: "first_name",
                last_name: "last_name",
            }),
        });

        const store = useFreshChatStore();

        expect(store.userData).toEqual(null);
    });

    it("should set the userData state correctly if there is user id", () => {
        useUserInfo.mockReturnValue({
            getUserInfo: ref({
                id: "id",
                mobile_phone: "mobile_phone",
                email: "email",
                first_name: "first_name",
                last_name: "last_name",
            }),
        });

        const store = useFreshChatStore();

        expect(store.userData).toEqual({
            externalId: "id",
            email: "email",
            firstName: "first_name",
            lastName: "last_name",
            phone: "mobile_phone",
        });
    });

    it("should set the freshChatData state correctly", () => {
        useUserInfo.mockReturnValue({
            getFreshChatRestoreId: ref("restoreId"),
            getFreshChatRestoreIdLoaded: ref(true),
            getDataIsLoaded: ref(true),
            getUserInfo: ref({
                id: "id",
            }),
        });

        const store = useFreshChatStore();

        expect(store.freshChatData).toEqual({
            token: "token",
            widgetUuid: "widgetUuid",
            restoreId: "restoreId",
            externalId: "id",
            pending: false,
            ...store.userData,
        });
    });

    it("should set the freshChatData state correctly if there is no user id", () => {
        useUserInfo.mockReturnValue({
            getFreshChatRestoreId: ref("restoreId"),
            getFreshChatRestoreIdLoaded: ref(true),
            getDataIsLoaded: ref(true),
            getUserInfo: ref({
                id: null,
            }),
        });

        const store = useFreshChatStore();

        expect(store.freshChatData).toEqual({
            token: "token",
            widgetUuid: "widgetUuid",
            restoreId: undefined,
            externalId: null,
            pending: false,
        });
    });

    it("should set the freshChatData state with pending true if Fresh Chat Restore Id is not loaded", () => {
        useUserInfo.mockReturnValue({
            getFreshChatRestoreId: ref("restoreId"),
            getFreshChatRestoreIdLoaded: ref(false),
            getDataIsLoaded: ref(true),
            getUserInfo: ref({
                id: "id",
            }),
        });

        const store = useFreshChatStore();

        expect(store.freshChatData).toEqual({
            token: "token",
            widgetUuid: "widgetUuid",
            restoreId: "restoreId",
            externalId: "id",
            pending: true,
            ...store.userData,
        });
    });
});
