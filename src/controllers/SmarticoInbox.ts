import { isServer } from "../helpers/ssrHelpers";
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

const PAGE_SIZE = 20;

function getReadStatus(filter: SmarticoInboxReadFilter) {
    return filter === "unread" ? InboxReadStatus.UnreadOnly : undefined;
}

function getActionError(result: InboxMarkMessageAction) {
    return new Error(result.err_message || "Smartico Inbox request failed");
}

function createSmarticoInboxController() {
    const store = useSmarticoInboxStore();
    const bodyRequests = new Map<string, Promise<TInboxMessageBody>>();
    let newMessageHandler: ((message: TInboxMessage, body: TInboxMessageBody) => void) | undefined;

    function getApi(): SmarticoGlobal["api"] {
        const smartico = isServer ? undefined : window._smartico;

        if (!smartico?.api) {
            throw new Error("Smartico Inbox API is not available");
        }

        return smartico.api;
    }

    function loadMessageBody(messageGuid: string) {
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

    function loadMessageBodies(messages: TInboxMessage[] = store.getInboxMessages) {
        return Promise.all(messages.map(({ message_guid }) => {
            return loadMessageBody(message_guid);
        }));
    }

    function setNewMessageHandler(
        handler?: (message: TInboxMessage, body: TInboxMessageBody) => void,
    ) {
        newMessageHandler = handler;
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
        }

        newMessages.forEach((message) => {
            handleNewMessage(message);
        });
    }

    async function loadMessagesByFilter(readFilter: SmarticoInboxReadFilter, subscribe = true) {
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
        isLoaded = true;

        if (pendingUpdate) {
            handleMessagesUpdate(pendingUpdate);
        }
    }

    function loadMessages(subscribe = true) {
        return loadMessagesByFilter(store.getInboxReadFilter, subscribe);
    }

    async function loadMore(from: number) {
        const api = getApi();
        const messages = await api.getInboxMessages({
            from,
            to: from + PAGE_SIZE,
            read_status: getReadStatus(store.getInboxReadFilter),
        });

        await loadMessageBodies(messages);

        return messages;
    }

    async function loadUnreadCount() {
        const api = getApi();
        const unreadCount = await api.getInboxUnreadCount({
            onUpdate: (updatedCount) => {
                store.setInboxUnreadCount(updatedCount);
            },
        });

        store.setInboxUnreadCount(unreadCount);
    }

    async function markAsRead(messageGuid: string) {
        const api = getApi();
        const message = store.getInboxMessages.find(({ message_guid: currentGuid }) => currentGuid === messageGuid);

        if (message?.read) {
            return;
        }

        const result = await api.markInboxMessageAsRead(messageGuid);

        if (result.err_code !== 0) {
            throw getActionError(result);
        }

        store.setInboxMessageAsRead(messageGuid);
    }

    async function markAllAsRead() {
        const api = getApi();
        const result = await api.markAllInboxMessagesAsRead();

        if (result.err_code !== 0) {
            throw getActionError(result);
        }

        await loadMessages(false);
    }

    async function toggleReadFilter() {
        const readFilter = store.getInboxReadFilter === "all" ? "unread" : "all";

        await loadMessagesByFilter(readFilter);
    }

    function reset() {
        bodyRequests.clear();
        store.clearInboxUserData();
    }

    async function initialize() {
        reset();
        await loadMessages();
        await loadUnreadCount();
    }

    return {
        initialize,
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
