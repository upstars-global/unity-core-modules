import { defineStore } from "pinia";
import { computed, ref } from "vue";

import {
    type SmarticoInboxReadFilter,
    type TInboxMessage,
    type TInboxMessageBody,
} from "../models/smarticoInbox";

export const useSmarticoInboxStore = defineStore("smarticoInbox", () => {
    const inboxMessages = ref<TInboxMessage[]>([]);
    const inboxMessageBodies = ref<Record<string, TInboxMessageBody>>({});
    const inboxUnreadCount = ref(0);
    const inboxReadFilter = ref<SmarticoInboxReadFilter>("all");

    const getInboxMessages = computed(() => inboxMessages.value);
    const getInboxUnreadCount = computed(() => inboxUnreadCount.value);
    const getInboxReadFilter = computed(() => inboxReadFilter.value);

    function setInboxMessages(messages: TInboxMessage[]) {
        inboxMessages.value = messages;
    }

    function getInboxMessageBody(messageGuid: string) {
        return inboxMessageBodies.value[messageGuid];
    }

    function setInboxMessageBody(messageGuid: string, body: TInboxMessageBody) {
        inboxMessageBodies.value = {
            ...inboxMessageBodies.value,
            [messageGuid]: body,
        };
    }

    function setInboxMessageAsRead(messageGuid: string) {
        inboxMessages.value = inboxMessages.value.map((message) => {
            return message.message_guid === messageGuid ? { ...message, read: true } : message;
        });
    }

    function setInboxUnreadCount(unreadCount: number) {
        inboxUnreadCount.value = unreadCount;
    }

    function setInboxReadFilter(filter: SmarticoInboxReadFilter) {
        inboxReadFilter.value = filter;
    }

    function clearInboxUserData() {
        inboxMessages.value = [];
        inboxMessageBodies.value = {};
        inboxUnreadCount.value = 0;
        inboxReadFilter.value = "all";
    }

    return {
        inboxMessages,
        inboxMessageBodies,
        inboxUnreadCount,
        inboxReadFilter,

        getInboxMessages,
        getInboxMessageBody,
        getInboxUnreadCount,
        getInboxReadFilter,

        setInboxMessages,
        setInboxMessageBody,
        setInboxMessageAsRead,
        setInboxUnreadCount,
        setInboxReadFilter,
        clearInboxUserData,
    };
});
