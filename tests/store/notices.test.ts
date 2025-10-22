vi.mock("@config/gift", () => ({
    excludeNotificationTitles: [ "EXCLUDED_TITLE" ],
}));
vi.mock("@config/user-statuses", () => ({
    ENABLED_NOTICES_USER_GROUP_IDS: [ 1, 2 ],
}));
vi.mock("@helpers/generateNotifications", () => ({
    eventsHandlers: new Proxy({}, {
        get: () => vi.fn(() => true),
    }),
}));
vi.mock("uuid", () => ({
    v4: vi.fn(() => "mock-uuid"),
}));
vi.mock("../../src/controllers/indexedDB/consts", () => ({
    IndexedDBEvents: { deleteData: "deleteData" },
}));
vi.mock("../../src/controllers/indexedDB/notificationsDB", () => ({
    useNotificationDB: vi.fn(() => ({
        notificationDB: {
            getAllData: vi.fn(() => Promise.resolve([])),
            saveData: vi.fn(),
            deleteData: vi.fn(),
            clearAllData: vi.fn(),
            eventTarget: { addEventListener: vi.fn() },
        },
    })),
}));
vi.mock("../../src/helpers/ssrHelpers", () => ({
    isServer: false,
}));
vi.mock("../../src/services/api/DTO/gifts", () => ({
    GiftState: { issued: "issued" },
}));
vi.mock("../../src/store/user/userStatuses", () => ({
    useUserStatuses: vi.fn(() => ({
        getUserGroups: ref([ 1, 2 ]),
    })),
}));
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

import { IConfigNotice, WSNotificationName } from "../../src/models/WSnotices";
import { GiftState } from "../../src/services/api/DTO/gifts";
import { useNoticesStore } from "../../src/store/notices";

vi.mock("../../src/store/user/userStatuses", () => ({
    useUserStatuses: vi.fn(() => ({
        getUserGroups: ref([ 1, 2 ]),
    })),
}));

vi.mock("../../src/controllers/indexedDB/notificationsDB", () => ({
    useNotificationDB: vi.fn(() => ({
        notificationDB: {
            getAllData: vi.fn(() => Promise.resolve([])),
            saveData: vi.fn(),
            deleteData: vi.fn(),
            clearAllData: vi.fn(),
            eventTarget: { addEventListener: vi.fn() },
        },
    })),
}));

describe("useNoticesStore", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it("initializes with default state", () => {
        const store = useNoticesStore();
        expect(store.headerNotices).toEqual([]);
        expect(store.notifications).toEqual([]);
        expect(store.enabledNotices).toBe(true);
    });

    it("addHeaderNoticeConfig adds notice", () => {
        const store = useNoticesStore();
        store.addHeaderNoticeConfig({ id: "1", message: "Test" } as IConfigNotice);
        expect(store.headerNotices).toEqual([ { id: "1", message: "Test" } ]);
    });

    it("deleteHeaderNotice removes notice", () => {
        const store = useNoticesStore();
        store.headerNotices = [ { id: "1", message: "Test" } as IConfigNotice ];
        store.deleteHeaderNotice("1");
        expect(store.headerNotices).toEqual([]);
    });

    it("addRealTimeNotification adds notification", () => {
        const store = useNoticesStore();
        store.addRealTimeNotification(
            { data:
                 {
                     id: 1,
                     type: WSNotificationName.PERSONAL_NOTIFICATIONS,
                     title: "Some title",
                     stage: GiftState.issued,
                 },
            },
            WSNotificationName.PERSONAL_NOTIFICATIONS,
        );
        expect(store.notifications.length).toBe(1);
    });

    it("deleteNotification removes notification", () => {
        const store = useNoticesStore();
        store.notifications = [ { id: "1", title: "Test", type: WSNotificationName.BONUSES_CHANGES } ];
        store.deleteNotification("1");
        expect(store.notifications).toEqual([]);
    });

    it("clearUserNotification clears all notifications", () => {
        const store = useNoticesStore();
        store.notifications = [ { id: "1", title: "Test", type: WSNotificationName.BONUSES_CHANGES } ];
        store.clearUserNotification();
        expect(store.notifications).toEqual([]);
    });
});
