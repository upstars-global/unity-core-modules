import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";

import { useSmarticoInboxStore } from "../../src/store/smarticoInbox";

describe("useSmarticoInboxStore", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it("sets, exposes and clears Smartico Inbox data", () => {
        const store = useSmarticoInboxStore();
        const message = {
            message_guid: "message-1",
            sent_date: "2026-03-01T12:00:00.000Z",
            read: false,
            favorite: false,
        };
        const body = {
            title: "Title",
            preview_body: "Preview",
            icon: "https://example.com/icon.png",
            action: "dp:inbox",
        };

        store.setInboxMessages([ message ]);
        store.setInboxMessageBody(message.message_guid, body);
        store.setInboxUnreadCount(1);
        store.setInboxReadFilter("unread");

        expect(store.getInboxMessages).toEqual([ message ]);
        expect(store.getInboxMessageBody(message.message_guid)).toEqual(body);
        expect(store.getInboxUnreadCount).toBe(1);
        expect(store.getInboxReadFilter).toBe("unread");

        store.clearInboxUserData();

        expect(store.getInboxMessages).toEqual([]);
        expect(store.getInboxMessageBody(message.message_guid)).toBeUndefined();
        expect(store.getInboxUnreadCount).toBe(0);
        expect(store.getInboxReadFilter).toBe("all");
    });

    it("marks an Inbox message as read", () => {
        const store = useSmarticoInboxStore();
        const messages = [
            {
                message_guid: "message-1",
                sent_date: "2026-03-01T12:00:00.000Z",
                read: false,
                favorite: false,
            },
            {
                message_guid: "message-2",
                sent_date: "2026-03-01T13:00:00.000Z",
                read: false,
                favorite: false,
            },
        ];

        store.setInboxMessages(messages);
        store.setInboxMessageAsRead("message-1");

        expect(store.getInboxMessages.map(({ read }) => read)).toEqual([ true, false ]);
    });
});
