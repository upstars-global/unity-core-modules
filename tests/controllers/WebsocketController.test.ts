import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { IProjectInfo } from "../../src/services/api/DTO/info";
import type { IUserSettings } from "../../src/services/api/DTO/playerDTO";
import { loadProjectInfoReq } from "../../src/services/api/requests/info";
import { loadNotificationCenterSubscriptionReq } from "../../src/services/api/requests/notificationCenter";
import { useCommon } from "../../src/store/common";
import { useUserInfo } from "../../src/store/user/userInfo";

const mocks = vi.hoisted(() => {
    const legacyInstances: Array<{
        _clientID: string;
        _subs: Record<string, unknown>;
        connect: ReturnType<typeof vi.fn>;
        disconnect: ReturnType<typeof vi.fn>;
        subscribe: ReturnType<typeof vi.fn>;
        onmessage?: (response: { data: string }) => void;
    }> = [];

    const notificationInstances: Array<{
        connect: ReturnType<typeof vi.fn>;
        disconnect: ReturnType<typeof vi.fn>;
        newSubscription: ReturnType<typeof vi.fn>;
        on: ReturnType<typeof vi.fn>;
        handlers: Record<string, (ctx?: unknown) => void>;
        subscriptions: Array<{
            channel: string;
            on: ReturnType<typeof vi.fn>;
            handlers: Record<string, (ctx?: unknown) => void>;
            subscribe: ReturnType<typeof vi.fn>;
            publicationHandler?: (ctx: { data: unknown }) => void;
        }>;
    }> = [];

    return {
        legacyInstances,
        notificationInstances,
    };
});

vi.mock("@config/centrifuge", () => ({
    getCentrifugeUrl: (url: string) => `normalized:${url}`,
}));

vi.mock("@config/gift", () => ({
    excludeNotificationTitles: [],
}));

vi.mock("@helpers/generateNotifications", () => ({
    eventsHandlers: {},
}));

vi.mock("../../src/controllers/Logger", () => ({
    default: {
        error: vi.fn(),
    },
    log: {
        error: vi.fn(),
    },
}));

vi.mock("centrifuge-legacy/centrifuge", () => ({
    default: vi.fn().mockImplementation(() => {
        const instance = {
            _clientID: "legacy-client-id",
            _subs: {},
            connect: vi.fn(),
            disconnect: vi.fn(),
            subscribe: vi.fn((channel: string, callback: (message: unknown) => void) => {
                instance._subs[channel] = callback;
            }),
            onmessage: undefined,
        };

        mocks.legacyInstances.push(instance);

        return instance;
    }),
}));

vi.mock("centrifuge", () => ({
    Centrifuge: vi.fn().mockImplementation(() => {
        const instance = {
            subscriptions: [] as Array<{
                channel: string;
                on: ReturnType<typeof vi.fn>;
                handlers: Record<string, (ctx?: unknown) => void>;
                subscribe: ReturnType<typeof vi.fn>;
                publicationHandler?: (ctx: { data: unknown }) => void;
            }>,
            handlers: {} as Record<string, (ctx?: unknown) => void>,
            connect: vi.fn(),
            disconnect: vi.fn(),
            on: vi.fn((event: string, handler: (ctx?: unknown) => void) => {
                instance.handlers[event] = handler;
            }),
            newSubscription: vi.fn((channel: string) => {
                const subscription = {
                    channel,
                    handlers: {} as Record<string, (ctx?: unknown) => void>,
                    on: vi.fn((event: string, handler: (ctx?: unknown) => void) => {
                        subscription.handlers[event] = handler;

                        if (event === "publication") {
                            subscription.publicationHandler = handler as (ctx: { data: unknown }) => void;
                        }
                    }),
                    subscribe: vi.fn(),
                    publicationHandler: undefined,
                };

                instance.subscriptions.push(subscription);

                return subscription;
            }),
        };

        mocks.notificationInstances.push(instance);

        return instance;
    }),
}));

vi.mock("../../src/services/api/requests/info", () => ({
    loadProjectInfoReq: vi.fn(),
}));

vi.mock("../../src/services/api/requests/notificationCenter", () => ({
    loadNotificationCenterSubscriptionReq: vi.fn(),
}));

const projectInfoWithNotificationFlow = (enabled: boolean) => ({
    notification_center: {
        new_realtime_notifications_flow_enabled: enabled,
    },
}) as IProjectInfo;

const userSettings = {
    cent: {
        user: "user-1",
        timestamp: "123",
        token: "legacy-token",
        authEndpoint: "/centrifuge/auth",
        url: "https://legacy.example.test",
    },
    recaptcha: "",
    recaptcha_version: 3,
} as IUserSettings;

async function importController() {
    return import("../../src/controllers/WebsocketController");
}

describe("WebsocketController", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
        mocks.legacyInstances.length = 0;
        mocks.notificationInstances.length = 0;
        vi.stubGlobal("location", { href: "https://example.test" });
        useUserInfo().setUserSettings(userSettings);
    });

    it("starts notification center flow from common project info without reloading project info", async () => {
        const commonStore = useCommon();
        const bus = { $emit: vi.fn() };
        commonStore.setProjectInfo(projectInfoWithNotificationFlow(true));
        vi.mocked(loadNotificationCenterSubscriptionReq).mockResolvedValue({
            user: "user-1",
            url: "wss://centrifugo.example.test",
            client_name: "client-a",
            token: "notification-token",
        });

        const { default: WebsocketController } = await importController();

        WebsocketController.init(bus);
        await WebsocketController.start();

        expect(loadProjectInfoReq).not.toHaveBeenCalled();
        expect(loadNotificationCenterSubscriptionReq).toHaveBeenCalledTimes(1);
        expect(mocks.legacyInstances).toHaveLength(0);
        expect(mocks.notificationInstances).toHaveLength(1);

        const client = mocks.notificationInstances[0];
        expect(client.connect).toHaveBeenCalledTimes(1);
        expect(client.on).toHaveBeenCalledWith("error", expect.any(Function));
        expect(client.on).toHaveBeenCalledWith("disconnected", expect.any(Function));
        expect(client.subscriptions.map(({ channel }) => channel)).toEqual(expect.arrayContaining([
            "ws:client-a:public:wins",
            "ws:client-a:public:jackpots_changes",
            "ws:client-a:balance#user-1",
        ]));

        const balanceSubscription = client.subscriptions.find(({ channel }) => channel === "ws:client-a:balance#user-1");
        balanceSubscription?.publicationHandler?.({ data: { amount: 100 } });

        expect(bus.$emit).toHaveBeenCalledWith("websocket.balance", { amount: 100 });
    });

    it("starts legacy flow when notification center flag is disabled", async () => {
        useCommon().setProjectInfo(projectInfoWithNotificationFlow(false));

        const { default: WebsocketController } = await importController();

        await WebsocketController.start();

        expect(loadProjectInfoReq).not.toHaveBeenCalled();
        expect(loadNotificationCenterSubscriptionReq).not.toHaveBeenCalled();
        expect(mocks.notificationInstances).toHaveLength(0);
        expect(mocks.legacyInstances).toHaveLength(1);

        const legacyClient = mocks.legacyInstances[0];
        expect(legacyClient.connect).toHaveBeenCalledTimes(1);
        expect(legacyClient.subscribe).toHaveBeenCalledWith("public:wins", expect.any(Function));
        expect(legacyClient.subscribe).toHaveBeenCalledWith("balance#user-1", expect.any(Function));
    });

    it("does not start legacy flow when notification center settings are missing and new flow is enabled", async () => {
        useCommon().setProjectInfo(projectInfoWithNotificationFlow(true));
        vi.mocked(loadNotificationCenterSubscriptionReq).mockResolvedValue(undefined);

        const { default: WebsocketController } = await importController();

        await WebsocketController.start();

        expect(loadNotificationCenterSubscriptionReq).toHaveBeenCalledTimes(1);
        expect(mocks.notificationInstances).toHaveLength(0);
        expect(mocks.legacyInstances).toHaveLength(0);
    });

    it("stops notification center flow without legacy fallback when client emits an async error", async () => {
        useCommon().setProjectInfo(projectInfoWithNotificationFlow(true));
        vi.mocked(loadNotificationCenterSubscriptionReq).mockResolvedValue({
            user: "user-1",
            url: "wss://centrifugo.example.test",
            client_name: "client-a",
            token: "bad-token",
        });

        const { default: WebsocketController } = await importController();

        await WebsocketController.start();
        mocks.notificationInstances[0].handlers.error?.({ error: new Error("connection rejected") });

        expect(mocks.notificationInstances).toHaveLength(1);
        expect(mocks.notificationInstances[0].disconnect).toHaveBeenCalledTimes(1);
        expect(mocks.legacyInstances).toHaveLength(0);
    });

    it("stops notification center flow without legacy fallback when client is disconnected asynchronously", async () => {
        useCommon().setProjectInfo(projectInfoWithNotificationFlow(true));
        vi.mocked(loadNotificationCenterSubscriptionReq).mockResolvedValue({
            user: "user-1",
            url: "wss://centrifugo.example.test",
            client_name: "client-a",
            token: "notification-token",
        });

        const { default: WebsocketController } = await importController();

        await WebsocketController.start();
        expect(mocks.legacyInstances).toHaveLength(0);

        mocks.notificationInstances[0].handlers.disconnected?.({});

        expect(mocks.notificationInstances[0].disconnect).toHaveBeenCalledTimes(1);
        expect(mocks.legacyInstances).toHaveLength(0);
    });
});
