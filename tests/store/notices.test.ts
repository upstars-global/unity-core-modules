vi.mock("@config/gift", () => ({
    excludeNotificationTitles: [ "EXCLUDED_TITLE" ],
}));
vi.mock("@config/user-statuses", () => ({
    ENABLED_NOTICES_USER_GROUP_IDS: [ 1, 2 ],
}));
vi.mock("@helpers/generateNotifications", () => ({
    eventsHandlers: {},
}));
vi.mock("uuid", () => ({
    v4: vi.fn(() => "mock-uuid"),
}));
vi.mock("../../src/controllers/indexedDB/consts", () => ({
    IndexedDBEvents: { deleteData: "deleteData" },
}));
const deleteHandler = vi.hoisted(() => ({ current: null as null | (() => void) }));
const notificationDbMock = vi.hoisted(() => ({
    getAllData: vi.fn(() => Promise.resolve([])),
    saveData: vi.fn(),
    deleteData: vi.fn(),
    clearAllData: vi.fn(),
    eventTarget: {
        addEventListener: vi.fn((_, handler: () => void) => {
            deleteHandler.current = handler;
        }),
    },
}));
vi.mock("../../src/controllers/indexedDB/notificationsDB", () => ({
    useNotificationDB: vi.fn(() => ({
        notificationDB: notificationDbMock,
    })),
}));
vi.mock("../../src/helpers/ssrHelpers", () => ({
    isServer: false,
}));
vi.mock("../../src/services/api/DTO/gifts", () => ({
    GiftState: { issued: "issued" },
}));
const userGroups = ref([ 1, 2 ]);
vi.mock("../../src/store/user/userStatuses", () => ({
    useUserStatuses: vi.fn(() => ({
        getUserGroups: userGroups,
    })),
}));
import { eventsHandlers } from "@helpers/generateNotifications";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

import { useNotificationDB } from "../../src/controllers/indexedDB/notificationsDB";
import { IConfigNotice, WSNotificationName } from "../../src/models/WSnotices";
import { GiftState } from "../../src/services/api/DTO/gifts";
import { useNoticesStore } from "../../src/store/notices";

describe("useNoticesStore", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        eventsHandlers[WSNotificationName.PERSONAL_NOTIFICATIONS] = vi.fn(() => ({ mapped: true }));
        eventsHandlers[WSNotificationName.BONUSES_CHANGES] = vi.fn(() => ({ bonus: true }));
        eventsHandlers[WSNotificationName.FREESPINS_CHANGES] = vi.fn(() => ({ spins: true }));
        userGroups.value = [ 1, 2 ];
        notificationDbMock.getAllData.mockClear();
        notificationDbMock.saveData.mockClear();
        notificationDbMock.deleteData.mockClear();
        notificationDbMock.clearAllData.mockClear();
        notificationDbMock.eventTarget.addEventListener.mockClear();
        deleteHandler.current = null;
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

    it("addHeaderNoticeConfig replaces notice with the same id", () => {
        const store = useNoticesStore();
        store.headerNotices = [ { id: "1", message: "Old" } as IConfigNotice ];
        store.addHeaderNoticeConfig({ id: "1", message: "New" } as IConfigNotice);

        expect(store.headerNotices).toEqual([ { id: "1", message: "New" } ]);
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

    it("addRealTimeNotification ignores excluded titles and non-issued stages", () => {
        const store = useNoticesStore();
        store.addRealTimeNotification(
            { data:
                 {
                     id: 1,
                     type: WSNotificationName.PERSONAL_NOTIFICATIONS,
                     title: "EXCLUDED_TITLE",
                     stage: GiftState.issued,
                 },
            },
            WSNotificationName.PERSONAL_NOTIFICATIONS,
        );
        store.addRealTimeNotification(
            { data:
                 {
                     id: 2,
                     type: WSNotificationName.BONUSES_CHANGES,
                     title: "Bonus",
                     stage: "canceled" as GiftState,
                 },
            },
            WSNotificationName.BONUSES_CHANGES,
        );
        store.addRealTimeNotification(
            { data:
                 {
                     id: 3,
                     type: WSNotificationName.FREESPINS_CHANGES,
                     title: "FS",
                     stage: "canceled" as GiftState,
                 },
            },
            WSNotificationName.FREESPINS_CHANGES,
        );

        expect(store.notifications.length).toBe(0);
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

    it("getAllNotifications maps using handlers and filters missing handlers", () => {
        const store = useNoticesStore();
        store.notifications = [
            { id: "1", title: "Test", type: WSNotificationName.PERSONAL_NOTIFICATIONS },
            { id: "2", title: "No handler", type: "unknown" as WSNotificationName },
        ];

        expect(store.getAllNotifications).toEqual([ { mapped: true } ]);
    });

    it("enabledNotices returns false when group is not enabled", () => {
        userGroups.value = [ 99 ];
        const store = useNoticesStore();
        expect(store.enabledNotices).toBe(false);
    });

    it("loads notifications from indexedDB on init", async () => {
        vi.resetModules();
        notificationDbMock.getAllData.mockResolvedValueOnce([ { id: "init", title: "Init" } ]);
        vi.doMock("../../src/helpers/ssrHelpers", () => ({
            isServer: false,
        }));
        vi.doMock("../../src/controllers/indexedDB/notificationsDB", () => ({
            useNotificationDB: vi.fn(() => ({
                notificationDB: notificationDbMock,
            })),
        }));
        const { useNoticesStore: useNoticesStoreFresh } = await import("../../src/store/notices");
        setActivePinia(createPinia());
        const store = useNoticesStoreFresh();

        await Promise.resolve();

        expect(store.notifications).toEqual([ { id: "init", title: "Init" } ]);
    });

    it("falls back to empty notifications when indexedDB returns null", async () => {
        vi.resetModules();
        notificationDbMock.getAllData.mockResolvedValueOnce(null);
        vi.doMock("../../src/helpers/ssrHelpers", () => ({
            isServer: false,
        }));
        vi.doMock("../../src/controllers/indexedDB/notificationsDB", () => ({
            useNotificationDB: vi.fn(() => ({
                notificationDB: notificationDbMock,
            })),
        }));
        const { useNoticesStore: useNoticesStoreFresh } = await import("../../src/store/notices");
        setActivePinia(createPinia());
        const store = useNoticesStoreFresh();

        await Promise.resolve();

        expect(store.notifications).toEqual([]);
    });

    it("refreshes notifications on indexedDB delete event", async () => {
        vi.resetModules();
        vi.doMock("../../src/helpers/ssrHelpers", () => ({
            isServer: false,
        }));
        vi.doMock("../../src/controllers/indexedDB/notificationsDB", () => ({
            useNotificationDB: vi.fn(() => ({
                notificationDB: notificationDbMock,
            })),
        }));
        const { useNoticesStore: useNoticesStoreFresh } = await import("../../src/store/notices");
        const { useNotificationDB: useNotificationDBFresh } = await import("../../src/controllers/indexedDB/notificationsDB");
        setActivePinia(createPinia());
        const store = useNoticesStoreFresh();
        const { notificationDB } = useNotificationDBFresh();

        const handler = deleteHandler.current;
        expect(notificationDB.eventTarget.addEventListener).toHaveBeenCalled();
        notificationDB.getAllData.mockResolvedValueOnce([ { id: "1", title: "FromDB" } ]);

        handler?.();
        await Promise.resolve();

        expect(store.notifications).toEqual([ { id: "1", title: "FromDB" } ]);
    });

    it("falls back to empty notifications on indexedDB delete event when null data", async () => {
        vi.resetModules();
        vi.doMock("../../src/helpers/ssrHelpers", () => ({
            isServer: false,
        }));
        vi.doMock("../../src/controllers/indexedDB/notificationsDB", () => ({
            useNotificationDB: vi.fn(() => ({
                notificationDB: notificationDbMock,
            })),
        }));
        const { useNoticesStore: useNoticesStoreFresh } = await import("../../src/store/notices");
        const { useNotificationDB: useNotificationDBFresh } = await import("../../src/controllers/indexedDB/notificationsDB");
        setActivePinia(createPinia());
        const store = useNoticesStoreFresh();
        const { notificationDB } = useNotificationDBFresh();

        const handler = deleteHandler.current;
        notificationDB.getAllData.mockResolvedValueOnce(null);

        handler?.();
        await Promise.resolve();

        expect(store.notifications).toEqual([]);
    });
});
