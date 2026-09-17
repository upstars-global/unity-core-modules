import type {
    InboxMarkMessageAction,
    SmarticoGlobal,
    SmarticoInboxReadFilter,
    TInboxMessage,
    TInboxMessageBody,
} from "../models/smarticoInbox";
import { InboxReadStatus } from "../models/smarticoInbox";
import { useSmarticoInboxStore } from "../store/smarticoInbox";
import { log } from "./Logger";
import { getSmartico } from "./Smartico";

const PAGE_SIZE = 20;

function getReadStatus(filter: SmarticoInboxReadFilter) {
    return filter === "unread" ? InboxReadStatus.UnreadOnly : undefined;
}

function getActionError(result: InboxMarkMessageAction) {
    return new Error(result.err_message || "Smartico Inbox request failed");
}

function createSmarticoInboxController() {
    const bodyRequests = new Map<string, Promise<TInboxMessageBody>>();
    let newMessageHandler: ((message: TInboxMessage, body: TInboxMessageBody) => void) | undefined;

    function getApi(): SmarticoGlobal["api"] {
        const smartico = getSmartico();

        if (!smartico?.api) {
            throw new Error("Smartico Inbox API is not available");
        }

        return smartico.api;
    }

    function loadMessageBody(messageGuid: string) {
        const store = useSmarticoInboxStore();
        const storedBody = store.getInboxMessageBody(messageGuid);

        if (storedBody) {
            return Promise.resolve(storedBody);
        }

        const currentRequest = bodyRequests.get(messageGuid);

        if (currentRequest) {
            return currentRequest;
        }

        const api = getApi();

        const request = api.getInboxMessageBody(messageGuid)
            .then((body) => {
                if (!body) {
                    throw new Error("Smartico Inbox message body is unavailable");
                }

                store.setInboxMessageBody(messageGuid, body);

                return body;
            })
            .finally(() => {
                bodyRequests.delete(messageGuid);
            });

        bodyRequests.set(messageGuid, request);

        return request;
    }

    function loadMessageBodies(messages?: TInboxMessage[]) {
        const inboxMessages = messages ?? useSmarticoInboxStore().getInboxMessages;

        return Promise.all(inboxMessages.map(({ message_guid }) => {
            return loadMessageBody(message_guid);
        }));
    }

    function setNewMessageHandler(
        handler?: (message: TInboxMessage, body: TInboxMessageBody) => void,
    ) {
        newMessageHandler = handler;
    }

    async function ensureMessageBodies(messages: TInboxMessage[]) {
        const store = useSmarticoInboxStore();
        const messagesHaveBodies = messages.every(({ message_guid }) => store.getInboxMessageBody(message_guid));

        if (store.isBodiesLoading || messagesHaveBodies) {
            return;
        }

        store.setIsBodiesLoading(true);

        try {
            await loadMessageBodies(messages);
        } catch (error) {
            log.error("SMARTICO_INBOX_LOAD_MESSAGE_BODIES_ERROR", error);
        } finally {
            store.setIsBodiesLoading(false);
        }
    }

    async function prepareMessage(message: TInboxMessage) {
        try {
            const body = await loadMessageBody(message.message_guid);
            await markAsRead(message);
            return body;
        } catch (error) {
            log.error("SMARTICO_INBOX_OPEN_MESSAGE_ERROR", error);
            return undefined;
        }
    }

    async function handleNewMessage(message: TInboxMessage) {
        let body: TInboxMessageBody;

        try {
            body = await loadMessageBody(message.message_guid);
        } catch (error) {
            log.error("SMARTICO_INBOX_LOAD_NEW_MESSAGE_BODY_ERROR", error);
            return;
        }

        newMessageHandler?.(message, body);
    }

    function handleMessagesUpdate(updatedMessages: TInboxMessage[]) {
        const store = useSmarticoInboxStore();
        const isUnreadFilter = store.getInboxReadFilter === "unread";
        const newMessages = updatedMessages.filter(({ message_guid: messageGuid, read }) => {
            return (!isUnreadFilter || !read) && !store.getInboxMessages.some(({ message_guid: currentGuid }) => {
                return currentGuid === messageGuid;
            });
        });

        if (isUnreadFilter) {
            loadMessages(false).catch((error) => {
                log.error("SMARTICO_INBOX_MESSAGES_UPDATE_ERROR", error);
            });
        } else {
            store.setInboxMessages(updatedMessages);
            store.setInboxHasMore(updatedMessages.length === PAGE_SIZE);
        }

        newMessages.forEach((message) => {
            handleNewMessage(message);
        });
    }

    async function loadMessagesByFilter(readFilter: SmarticoInboxReadFilter, subscribe = true) {
        const store = useSmarticoInboxStore();
        const api = getApi();
        let pendingUpdate: TInboxMessage[] | undefined;
        let isLoaded = false;

        const messages = await api.getInboxMessages({
            from: 0,
            to: PAGE_SIZE,
            read_status: getReadStatus(readFilter),
            onUpdate: subscribe ? (updatedMessages) => {
                if (!isLoaded) {
                    pendingUpdate = updatedMessages;

                    return;
                }

                handleMessagesUpdate(updatedMessages);
            } : undefined,
        });

        store.setInboxReadFilter(readFilter);
        store.setInboxMessages(messages);
        store.setInboxHasMore(messages.length === PAGE_SIZE);
        isLoaded = true;

        if (pendingUpdate) {
            handleMessagesUpdate(pendingUpdate);
        }
    }

    function loadMessages(subscribe = true) {
        const store = useSmarticoInboxStore();

        return loadMessagesByFilter(store.getInboxReadFilter, subscribe);
    }

    async function loadMore(from: number) {
        const store = useSmarticoInboxStore();

        if (store.isLoadingMore) {
            return;
        }

        store.setIsLoadingMore(true);

        try {
            const currentMessages = store.getInboxMessages;
            const api = getApi();
            const messages = await api.getInboxMessages({
                from,
                to: from + PAGE_SIZE,
                read_status: getReadStatus(store.getInboxReadFilter),
            });

            await loadMessageBodies(messages);

            if (store.getInboxMessages !== currentMessages) {
                return messages;
            }

            const currentGuids = new Set(currentMessages.map(({ message_guid }) => message_guid));
            store.setInboxMessages([
                ...currentMessages,
                ...messages.filter(({ message_guid }) => !currentGuids.has(message_guid)),
            ]);
            store.setInboxHasMore(messages.length === PAGE_SIZE);

            return messages;
        } catch (error) {
            log.error("SMARTICO_INBOX_LOAD_MORE_ERROR", error);
        } finally {
            store.setIsLoadingMore(false);
        }
    }

    async function loadUnreadCount() {
        const store = useSmarticoInboxStore();
        const api = getApi();
        const unreadCount = await api.getInboxUnreadCount({
            onUpdate: (updatedCount) => {
                store.setInboxUnreadCount(updatedCount);
            },
        });

        store.setInboxUnreadCount(unreadCount);
    }

    async function markAsRead(message: TInboxMessage) {
        const store = useSmarticoInboxStore();
        const api = getApi();

        if (message.read) {
            return;
        }

        const result = await api.markInboxMessageAsRead(message.message_guid);

        if (result.err_code !== 0) {
            throw getActionError(result);
        }

        store.setInboxMessageAsRead(message.message_guid);
    }

    async function markAllAsRead() {
        const store = useSmarticoInboxStore();
        if (store.isMessagesLoading) {
            return;
        }

        store.setIsMessagesLoading(true);
        try {
            const result = await getApi().markAllInboxMessagesAsRead();
            if (result.err_code !== 0) {
                throw getActionError(result);
            }

            await loadMessages(false);
        } catch (error) {
            log.error("SMARTICO_INBOX_MARK_ALL_AS_READ_ERROR", error);
        } finally {
            store.setIsMessagesLoading(false);
        }
    }

    async function toggleReadFilter() {
        const store = useSmarticoInboxStore();
        if (store.isMessagesLoading) {
            return;
        }
        const readFilter = store.getInboxReadFilter === "all" ? "unread" : "all";

        store.setIsMessagesLoading(true);
        try {
            await loadMessagesByFilter(readFilter);
        } catch (error) {
            log.error("SMARTICO_INBOX_TOGGLE_FILTER_ERROR", error);
        } finally {
            store.setIsMessagesLoading(false);
        }
    }

    function reset() {
        bodyRequests.clear();
        useSmarticoInboxStore().clearInboxUserData();
    }

    async function initialize() {
        reset();
        const store = useSmarticoInboxStore();
        store.setIsMessagesLoading(true);
        try {
            await Promise.all([loadMessages(), loadUnreadCount()]);
        } catch (error) {
            log.error("SMARTICO_INBOX_INITIALIZE_ERROR", error);
        } finally {
            store.setIsMessagesLoading(false);
        }
    }

    return {
        initialize,
        ensureMessageBodies,
        prepareMessage,
        loadMessageBody,
        loadMessageBodies,
        loadMessages,
        loadMore,
        markAsRead,
        markAllAsRead,
        setNewMessageHandler,
        toggleReadFilter,
        reset,
    };
}

let smarticoInboxController: ReturnType<typeof createSmarticoInboxController>;

export function useSmarticoInboxController() {
    if (!smarticoInboxController) {
        smarticoInboxController = createSmarticoInboxController();
    }

    return smarticoInboxController;
}
