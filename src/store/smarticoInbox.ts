import { defineStore } from "pinia";
import { computed, ref } from "vue";

import {
    type ISmarticoInboxMessage,
    type ISmarticoInboxMessageBody,
    type SmarticoInboxReadFilter,
} from "../models/smarticoInbox";

export const useSmarticoInboxStore = defineStore("smarticoInbox", () => {
    const inboxMessages = ref<ISmarticoInboxMessage[]>([]);
    const inboxMessageBodies = ref<Record<string, ISmarticoInboxMessageBody>>({});
    const inboxUnreadCount = ref(0);
    const inboxReadFilter = ref<SmarticoInboxReadFilter>("all");
    const inboxHasMore = ref(false);

    const getInboxMessages = computed(() => inboxMessages.value);
    const getInboxUnreadCount = computed(() => inboxUnreadCount.value);
    const getInboxReadFilter = computed(() => inboxReadFilter.value);
    const getInboxHasMore = computed(() => inboxHasMore.value);
    
    function getInboxMessageBody(messageGuid: string) {
        return inboxMessageBodies.value[messageGuid];
    }

    function setInboxMessages(messages: ISmarticoInboxMessage[]) {
        inboxMessages.value = messages;
    }

    function setInboxMessageAsRead(messageGuid: string) {
        inboxMessages.value = inboxMessages.value.map((message) => {
            return message.message_guid === messageGuid ? { ...message, read: true } : message;
        });
    }

    function setAllInboxMessagesAsRead() {
        inboxMessages.value = inboxMessages.value.map((message) => ({ ...message, read: true }));
    }

    function setInboxMessageBody(messageGuid: string, body: ISmarticoInboxMessageBody) {
        inboxMessageBodies.value = {
            ...inboxMessageBodies.value,
            [messageGuid]: body,
        };
    }

    function setInboxUnreadCount(unreadCount: number) {
        inboxUnreadCount.value = unreadCount;
    }

    function setInboxReadFilter(filter: SmarticoInboxReadFilter) {
        inboxReadFilter.value = filter;
    }

    function setInboxHasMore(hasMore: boolean) {
        inboxHasMore.value = hasMore;
    }

    function clearInboxUserData() {
        inboxMessages.value = [];
        inboxMessageBodies.value = {};
        inboxUnreadCount.value = 0;
        inboxReadFilter.value = "all";
        inboxHasMore.value = false;
    }

    return {
        inboxMessages,
        inboxMessageBodies,
        inboxUnreadCount,
        inboxReadFilter,
        inboxHasMore,

        getInboxMessages,
        getInboxMessageBody,
        getInboxUnreadCount,
        getInboxReadFilter,
        getInboxHasMore,

        setInboxMessages,
        setInboxMessageAsRead,
        setAllInboxMessagesAsRead,
        setInboxMessageBody,
        setInboxUnreadCount,
        setInboxReadFilter,
        setInboxHasMore,
        clearInboxUserData,
    };
});
