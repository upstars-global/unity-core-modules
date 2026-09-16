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
    const inboxHasMore = ref(false);
    const inboxReadFilter = ref<SmarticoInboxReadFilter>("all");

    const getInboxMessages = computed(() => inboxMessages.value);
    const getInboxUnreadCount = computed(() => inboxUnreadCount.value);
    const getInboxHasMore = computed(() => inboxHasMore.value);
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
        const message = inboxMessages.value.find(({ message_guid }) => {
            return message_guid === messageGuid;
        });

        if (message) {
            message.read = true;
        }
    }

    function setInboxUnreadCount(unreadCount: number) {
        inboxUnreadCount.value = unreadCount;
    }

    function setInboxHasMore(hasMore: boolean) {
        inboxHasMore.value = hasMore;
    }

    function setInboxReadFilter(filter: SmarticoInboxReadFilter) {
        inboxReadFilter.value = filter;
    }

    function clearInboxUserData() {
        inboxMessages.value = [];
        inboxMessageBodies.value = {};
        inboxUnreadCount.value = 0;
        inboxHasMore.value = false;
        inboxReadFilter.value = "all";
    }

    return {
        inboxMessages,
        inboxMessageBodies,
        inboxUnreadCount,
        inboxHasMore,
        inboxReadFilter,

        getInboxMessages,
        getInboxMessageBody,
        getInboxUnreadCount,
        getInboxHasMore,
        getInboxReadFilter,

        setInboxMessages,
        setInboxMessageBody,
        setInboxMessageAsRead,
        setInboxUnreadCount,
        setInboxHasMore,
        setInboxReadFilter,
        clearInboxUserData,
    };
});
