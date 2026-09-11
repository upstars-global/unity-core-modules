// @vitest-environment happy-dom

import { beforeEach, describe, expect, test, vi } from "vitest";

import type {
    SmarticoGlobal,
    TInboxMessage,
    TInboxMessageBody,
} from "../../src/models/smarticoInbox";

const mocks = vi.hoisted(() => {
    const state = {
        messages: [] as TInboxMessage[],
        messageBodies: {} as Record<string, TInboxMessageBody>,
        unreadCount: 0,
        readFilter: "unread" as "all" | "unread",
    };

    return {
        logError: vi.fn(),
        state,
        store: {
            get getInboxMessages() {
                return state.messages;
            },
            getInboxMessageBody(messageGuid: string) {
                return state.messageBodies[messageGuid];
            },
            get getInboxUnreadCount() {
                return state.unreadCount;
            },
            get getInboxReadFilter() {
                return state.readFilter;
            },
            setInboxMessages: vi.fn((messages: TInboxMessage[]) => {
                state.messages = messages;
            }),
            setInboxMessageBody: vi.fn((messageGuid: string, body: TInboxMessageBody) => {
                state.messageBodies = { ...state.messageBodies, [messageGuid]: body };
            }),
            setInboxMessageAsRead: vi.fn((messageGuid: string) => {
                state.messages = state.messages.map((message) => {
                    return message.message_guid === messageGuid ? { ...message, read: true } : message;
                });
            }),
            setInboxUnreadCount: vi.fn((unreadCount: number) => {
                state.unreadCount = unreadCount;
            }),
            setInboxReadFilter: vi.fn((filter: "all" | "unread") => {
                state.readFilter = filter;
            }),
            clearInboxUserData: vi.fn(),
        },
    };
});

vi.mock("../../src/helpers/ssrHelpers", () => ({
    isServer: false,
}));

vi.mock("../../src/controllers/Logger", () => ({
    log: {
        error: mocks.logError,
    },
}));

vi.mock("../../src/store/smarticoInbox", () => ({
    useSmarticoInboxStore: () => mocks.store,
}));

function createMessage(index: number, read = false): TInboxMessage {
    return {
        message_guid: `message-${ index }`,
        sent_date: "2026-03-01T12:00:00.000Z",
        read,
        favorite: false,
    };
}

function createBody(index: number): TInboxMessageBody {
    return {
        title: `Title ${ index }`,
        preview_body: `Preview ${ index }`,
        icon: `https://example.com/icon-${ index }.png`,
        action: "dp:inbox",
    };
}

function createApi() {
    return {
        getInboxMessages: vi.fn<SmarticoGlobal["api"]["getInboxMessages"]>(),
        getInboxMessageBody: vi.fn<SmarticoGlobal["api"]["getInboxMessageBody"]>(),
        getInboxUnreadCount: vi.fn<SmarticoGlobal["api"]["getInboxUnreadCount"]>(),
        markInboxMessageAsRead: vi.fn<SmarticoGlobal["api"]["markInboxMessageAsRead"]>(),
        markAllInboxMessagesAsRead: vi.fn<SmarticoGlobal["api"]["markAllInboxMessagesAsRead"]>(),
    };
}

function resetStore() {
    mocks.state.messages = [];
    mocks.state.messageBodies = {};
    mocks.state.unreadCount = 0;
    mocks.state.readFilter = "unread";
}

describe("useSmarticoInboxController", () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
        resetStore();
        mocks.store.clearInboxUserData.mockImplementation(resetStore);
        delete window._smartico;
    });

    test("reuses one controller instance", async() => {
        const { useSmarticoInboxController } = await import("../../src/controllers/SmarticoInbox");

        const firstController = useSmarticoInboxController();
        const secondController = useSmarticoInboxController();

        expect(firstController).toBe(secondController);
    });

    test("loads messages and unread count with subscriptions", async() => {
        const api = createApi();
        let messagesUpdate: ((messages: TInboxMessage[]) => void) | undefined;
        let unreadCountUpdate: ((count: number) => void) | undefined;
        let resolveMessages: ((messages: TInboxMessage[]) => void) | undefined;

        api.getInboxMessages
            .mockImplementationOnce((params) => {
                messagesUpdate = params?.onUpdate;

                return new Promise((resolve) => {
                    resolveMessages = resolve;
                });
            })
            .mockResolvedValueOnce([ createMessage(2) ]);
        api.getInboxMessageBody.mockImplementation(async(messageGuid) => {
            return createBody(Number(messageGuid.replace("message-", "")));
        });
        api.getInboxUnreadCount.mockImplementation(async(params) => {
            unreadCountUpdate = params?.onUpdate;
            return 1;
        });
        window._smartico = { api } as unknown as SmarticoGlobal;

        const { useSmarticoInboxController } = await import("../../src/controllers/SmarticoInbox");
        const newMessageListener = vi.fn();
        const controller = useSmarticoInboxController();

        const initializeRequest = controller.initialize();

        await vi.waitFor(() => expect(resolveMessages).toBeDefined());
        expect(api.getInboxUnreadCount).not.toHaveBeenCalled();

        resolveMessages?.([ createMessage(1) ]);
        await initializeRequest;
        controller.setNewMessageHandler(newMessageListener);

        expect(mocks.state.messages).toEqual([ createMessage(1) ]);
        expect(api.getInboxMessageBody).not.toHaveBeenCalled();
        expect(mocks.state.unreadCount).toBe(1);

        messagesUpdate?.([ createMessage(2), createMessage(1, true) ]);
        unreadCountUpdate?.(2);

        await vi.waitFor(() => {
            expect(mocks.state.messageBodies["message-2"]).toEqual(createBody(2));
        });
        expect(mocks.state.messages).toEqual([ createMessage(2) ]);
        expect(api.getInboxMessageBody).toHaveBeenCalledOnce();
        expect(api.getInboxMessageBody).toHaveBeenCalledWith("message-2");
        expect(newMessageListener).toHaveBeenCalledWith(createMessage(2), createBody(2));
        expect(mocks.state.unreadCount).toBe(2);

        await controller.loadMessageBodies();

        expect(mocks.state.messages).toEqual([ createMessage(2) ]);
        expect(mocks.state.messageBodies).toEqual({ "message-2": createBody(2) });
        expect(api.getInboxMessageBody).toHaveBeenCalledOnce();
    });

    test("processes an early update after the initial messages are stored", async() => {
        const api = createApi();
        const currentMessage = createMessage(1);
        const newMessage = createMessage(2);
        let messagesUpdate: ((messages: TInboxMessage[]) => void) | undefined;
        let resolveMessages: ((messages: TInboxMessage[]) => void) | undefined;

        api.getInboxMessages.mockImplementationOnce((params) => {
            messagesUpdate = params?.onUpdate;

            return new Promise((resolve) => {
                resolveMessages = resolve;
            });
        });
        api.getInboxMessageBody.mockResolvedValue(createBody(2));
        window._smartico = { api } as unknown as SmarticoGlobal;

        const { useSmarticoInboxController } = await import("../../src/controllers/SmarticoInbox");
        const newMessageListener = vi.fn();
        const controller = useSmarticoInboxController();

        mocks.state.readFilter = "all";
        controller.setNewMessageHandler(newMessageListener);
        const request = controller.loadMessages();

        await vi.waitFor(() => expect(messagesUpdate).toBeDefined());
        messagesUpdate?.([ newMessage, currentMessage ]);
        resolveMessages?.([ currentMessage ]);
        await request;

        await vi.waitFor(() => {
            expect(newMessageListener).toHaveBeenCalledWith(newMessage, createBody(2));
        });
        expect(mocks.state.messages).toEqual([ newMessage, currentMessage ]);
        expect(newMessageListener).toHaveBeenCalledOnce();
    });

    test("returns the next page with bodies and applies the read filter on the server", async() => {
        const api = createApi();
        const firstPage = Array.from({ length: 20 }, (_, index) => createMessage(index));
        let messagesUpdate: ((messages: TInboxMessage[]) => void) | undefined;

        api.getInboxMessages
            .mockImplementationOnce(async(params) => {
                messagesUpdate = params?.onUpdate;
                return firstPage;
            })
            .mockResolvedValueOnce([ createMessage(20) ])
            .mockResolvedValueOnce([ createMessage(99), ...firstPage.slice(0, 19) ])
            .mockResolvedValueOnce([ createMessage(30) ]);
        api.getInboxMessageBody.mockImplementation(async(messageGuid) => {
            return createBody(Number(messageGuid.replace("message-", "")));
        });
        api.getInboxUnreadCount.mockResolvedValue(0);
        window._smartico = { api } as unknown as SmarticoGlobal;

        const { useSmarticoInboxController } = await import("../../src/controllers/SmarticoInbox");
        const controller = useSmarticoInboxController();
        await controller.initialize();
        await controller.loadMessageBodies();
        const loadedMessages = await controller.loadMore(firstPage.length);

        expect(loadedMessages).toEqual([ createMessage(20) ]);
        expect(mocks.state.messages).toEqual(firstPage);
        expect(Object.keys(mocks.state.messageBodies)).toHaveLength(21);

        messagesUpdate?.([ createMessage(99), ...firstPage.slice(0, 19) ]);

        await vi.waitFor(() => {
            expect(mocks.state.messages).toEqual([
                createMessage(99),
                ...firstPage.slice(0, 19),
            ]);
        });
        await vi.waitFor(() => {
            expect(mocks.state.messageBodies["message-99"]).toEqual(createBody(99));
        });
        await controller.toggleReadFilter();

        expect(api.getInboxMessages).toHaveBeenNthCalledWith(2, {
            from: 20,
            to: 40,
            read_status: 1,
        });
        expect(api.getInboxMessages).toHaveBeenLastCalledWith({
            from: 0,
            to: 20,
            read_status: undefined,
            onUpdate: expect.any(Function),
        });
        expect(mocks.state.messages).toEqual([ createMessage(30) ]);
        expect(api.getInboxMessageBody).toHaveBeenCalledTimes(22);
    });

    test("reloads the unread list without treating known read messages as new", async() => {
        const api = createApi();
        const knownReadMessage = createMessage(1, true);
        const knownUnreadMessage = createMessage(2);
        const newMessage = createMessage(3);
        let messagesUpdate: ((messages: TInboxMessage[]) => void) | undefined;

        api.getInboxMessages
            .mockImplementationOnce(async(params) => {
                messagesUpdate = params?.onUpdate;

                return [ knownUnreadMessage ];
            })
            .mockResolvedValueOnce([ newMessage, knownUnreadMessage ]);
        api.getInboxMessageBody.mockImplementation(async(messageGuid) => {
            return createBody(Number(messageGuid.replace("message-", "")));
        });
        api.getInboxUnreadCount.mockResolvedValue(1);
        window._smartico = { api } as unknown as SmarticoGlobal;

        const { useSmarticoInboxController } = await import("../../src/controllers/SmarticoInbox");
        const newMessageListener = vi.fn();
        const controller = useSmarticoInboxController();

        await controller.initialize();
        controller.setNewMessageHandler(newMessageListener);

        messagesUpdate?.([ newMessage, knownReadMessage, knownUnreadMessage ]);

        await vi.waitFor(() => {
            expect(mocks.state.messages).toEqual([ newMessage, knownUnreadMessage ]);
        });
        await vi.waitFor(() => {
            expect(newMessageListener).toHaveBeenCalledWith(newMessage, createBody(3));
        });
        expect(newMessageListener).toHaveBeenCalledOnce();
        expect(api.getInboxMessageBody).toHaveBeenCalledOnce();
        expect(api.getInboxMessageBody).toHaveBeenCalledWith("message-3");
        expect(api.getInboxMessages).toHaveBeenLastCalledWith({
            from: 0,
            to: 20,
            read_status: 1,
            onUpdate: undefined,
        });
    });

    test("keeps the current filter and messages when loading another filter fails", async() => {
        const api = createApi();
        const currentMessages = [ createMessage(1) ];

        mocks.state.readFilter = "all";
        mocks.state.messages = currentMessages;
        api.getInboxMessages.mockRejectedValue(new Error("Request failed"));
        window._smartico = { api } as unknown as SmarticoGlobal;

        const { useSmarticoInboxController } = await import("../../src/controllers/SmarticoInbox");
        const controller = useSmarticoInboxController();

        await expect(controller.toggleReadFilter()).rejects.toThrow("Request failed");

        expect(mocks.state.readFilter).toBe("all");
        expect(mocks.state.messages).toEqual(currentMessages);
        expect(api.getInboxMessages).toHaveBeenCalledWith({
            from: 0,
            to: 20,
            read_status: 1,
            onUpdate: expect.any(Function),
        });
    });

    test("reuses an active message body request", async() => {
        const api = createApi();

        api.getInboxMessages.mockResolvedValue([ createMessage(1) ]);
        api.getInboxMessageBody.mockResolvedValue(createBody(1));
        api.getInboxUnreadCount.mockResolvedValue(0);
        window._smartico = { api } as unknown as SmarticoGlobal;

        const { useSmarticoInboxController } = await import("../../src/controllers/SmarticoInbox");
        const controller = useSmarticoInboxController();

        await controller.initialize();
        await Promise.all([
            controller.loadMessageBodies(),
            controller.loadMessageBodies(),
        ]);
        await controller.loadMessageBody("message-1");

        expect(api.getInboxMessageBody).toHaveBeenCalledOnce();
        expect(mocks.state.messages).toEqual([ createMessage(1) ]);
        expect(mocks.state.messageBodies).toEqual({ "message-1": createBody(1) });
    });

    test("rejects loading message bodies when one of the requests fails", async() => {
        const api = createApi();
        const error = new Error("Request failed");

        mocks.state.messages = [ createMessage(1), createMessage(2) ];
        api.getInboxMessageBody
            .mockResolvedValueOnce(createBody(1))
            .mockRejectedValueOnce(error);
        window._smartico = { api } as unknown as SmarticoGlobal;

        const { useSmarticoInboxController } = await import("../../src/controllers/SmarticoInbox");

        await expect(useSmarticoInboxController().loadMessageBodies()).rejects.toBe(error);
        expect(mocks.state.messageBodies["message-1"]).toEqual(createBody(1));
        expect(mocks.state.messageBodies["message-2"]).toBeUndefined();
        expect(mocks.logError).not.toHaveBeenCalled();
    });

    test("retries loading a new message body after a background request fails", async() => {
        const api = createApi();
        const error = new Error("Request failed");
        const newMessageListener = vi.fn();
        let messagesUpdate: ((messages: TInboxMessage[]) => void) | undefined;

        api.getInboxMessages.mockImplementation(async(params) => {
            messagesUpdate = params?.onUpdate;
            return [ createMessage(1) ];
        });
        api.getInboxMessageBody
            .mockRejectedValueOnce(error)
            .mockResolvedValueOnce(createBody(2));
        api.getInboxUnreadCount.mockResolvedValue(0);
        window._smartico = { api } as unknown as SmarticoGlobal;

        const { useSmarticoInboxController } = await import("../../src/controllers/SmarticoInbox");
        const controller = useSmarticoInboxController();

        await controller.initialize();
        controller.setNewMessageHandler(newMessageListener);
        messagesUpdate?.([ createMessage(2), createMessage(1) ]);

        await vi.waitFor(() => {
            expect(api.getInboxMessageBody).toHaveBeenCalledOnce();
        });
        expect(newMessageListener).not.toHaveBeenCalled();
        expect(mocks.state.messageBodies["message-2"]).toBeUndefined();
        await vi.waitFor(() => {
            expect(mocks.logError).toHaveBeenCalledWith(
                "SMARTICO_INBOX_LOAD_NEW_MESSAGE_BODY_ERROR",
                error,
            );
        });

        await vi.waitFor(async() => {
            await expect(controller.loadMessageBody("message-2")).resolves.toEqual(createBody(2));
        });

        expect(api.getInboxMessageBody).toHaveBeenCalledTimes(2);
        expect(mocks.state.messageBodies["message-2"]).toEqual(createBody(2));
    });

    test("does not store or emit an empty message body returned by Smartico", async() => {
        const api = createApi();
        const newMessageListener = vi.fn();
        let messagesUpdate: ((messages: TInboxMessage[]) => void) | undefined;

        api.getInboxMessages.mockImplementation(async(params) => {
            messagesUpdate = params?.onUpdate;
            return [ createMessage(1) ];
        });
        api.getInboxMessageBody.mockResolvedValue(null as unknown as TInboxMessageBody);
        api.getInboxUnreadCount.mockResolvedValue(0);
        window._smartico = { api } as unknown as SmarticoGlobal;

        const { useSmarticoInboxController } = await import("../../src/controllers/SmarticoInbox");
        const controller = useSmarticoInboxController();

        await controller.initialize();
        controller.setNewMessageHandler(newMessageListener);
        messagesUpdate?.([ createMessage(2), createMessage(1) ]);

        await vi.waitFor(() => {
            expect(api.getInboxMessageBody).toHaveBeenCalledOnce();
        });
        expect(mocks.state.messageBodies["message-2"]).toBeUndefined();
        expect(newMessageListener).not.toHaveBeenCalled();
        await vi.waitFor(() => {
            expect(mocks.logError).toHaveBeenCalledWith(
                "SMARTICO_INBOX_LOAD_NEW_MESSAGE_BODY_ERROR",
                expect.objectContaining({ message: "Smartico Inbox message body is unavailable" }),
            );
        });
    });

    test("logs a failed background reload after an unread messages update", async() => {
        const api = createApi();
        const error = new Error("Request failed");
        let messagesUpdate: ((messages: TInboxMessage[]) => void) | undefined;

        api.getInboxMessages
            .mockImplementationOnce(async(params) => {
                messagesUpdate = params?.onUpdate;
                return [ createMessage(1) ];
            })
            .mockRejectedValueOnce(error);
        api.getInboxMessageBody.mockResolvedValue(createBody(2));
        api.getInboxUnreadCount.mockResolvedValue(1);
        window._smartico = { api } as unknown as SmarticoGlobal;

        const { useSmarticoInboxController } = await import("../../src/controllers/SmarticoInbox");
        const controller = useSmarticoInboxController();

        await controller.initialize();
        messagesUpdate?.([ createMessage(2), createMessage(1) ]);

        await vi.waitFor(() => {
            expect(mocks.logError).toHaveBeenCalledWith(
                "SMARTICO_INBOX_MESSAGES_UPDATE_ERROR",
                error,
            );
        });
    });

    test("keeps a message unchanged when marking it as read fails", async() => {
        const api = createApi();

        mocks.state.messages = [ createMessage(1) ];
        mocks.state.unreadCount = 1;
        api.markInboxMessageAsRead.mockResolvedValue({ err_code: 1, err_message: "Rejected" });
        window._smartico = { api } as unknown as SmarticoGlobal;

        const { useSmarticoInboxController } = await import("../../src/controllers/SmarticoInbox");
        const request = useSmarticoInboxController().markAsRead("message-1");

        expect(mocks.state.messages.map(({ read }) => read)).toEqual([ false ]);
        expect(mocks.state.unreadCount).toBe(1);

        await expect(request).rejects.toThrow("Rejected");
        expect(mocks.state.messages.map(({ read }) => read)).toEqual([ false ]);
        expect(mocks.state.unreadCount).toBe(1);
    });

    test("updates one message locally and reloads messages after marking all as read", async() => {
        const api = createApi();

        mocks.state.readFilter = "all";
        mocks.state.messages = [ createMessage(1), createMessage(2) ];
        mocks.state.unreadCount = 2;
        api.markInboxMessageAsRead.mockResolvedValue({ err_code: 0, err_message: "" });
        api.markAllInboxMessagesAsRead.mockResolvedValue({ err_code: 0, err_message: "" });
        api.getInboxMessages.mockResolvedValue([ createMessage(1, true), createMessage(2, true) ]);
        window._smartico = { api } as unknown as SmarticoGlobal;

        const { useSmarticoInboxController } = await import("../../src/controllers/SmarticoInbox");
        const controller = useSmarticoInboxController();

        await controller.markAsRead("message-1");

        expect(mocks.state.messages.map(({ read }) => read)).toEqual([ true, false ]);
        expect(mocks.state.unreadCount).toBe(2);

        await controller.markAllAsRead();

        expect(mocks.state.messages.every(({ read }) => read)).toBe(true);
        expect(mocks.state.unreadCount).toBe(2);
        expect(api.getInboxMessages).toHaveBeenCalledWith({
            from: 0,
            to: 20,
            read_status: undefined,
            onUpdate: undefined,
        });
    });
});
