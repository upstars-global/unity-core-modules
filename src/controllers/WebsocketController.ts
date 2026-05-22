import { getCentrifugeUrl } from "@config/centrifuge";
import { Centrifuge } from "centrifuge";
import CentrifugeLegacy from "centrifuge-legacy/centrifuge";
import { storeToRefs } from "pinia";

import log from "../controllers/Logger";
import { type INotificationCenterSubscription } from "../services/api/DTO/notificationCenter";
import { loadNotificationCenterSubscriptionReq } from "../services/api/requests/notificationCenter";
import { addBonusNotificationItem, loadSocketConnection } from "../services/betting";
import { loadProjectInfo } from "../services/common";
import { useCommon } from "../store/common";
import { useEnvironments } from "../store/environments";
import { useMultilangStore } from "../store/multilang";
import { useUserInfo } from "../store/user/userInfo";

let sock: LegacyCentrifugeClient | null = null;
let notificationCenterClient: Centrifuge | null = null;
let bettingClient: Centrifuge | null = null;
let $bus: Partial<IBus> = {};

interface LegacyCentrifugeClient {
    _clientID?: string;
    _subs: Record<string, unknown>;
    onmessage?: (response: { data: string }) => void;
    connect(): void;
    disconnect(): void;
    subscribe(channel: string, callback: (message: unknown) => void): void;
}

export const CHANNELS_TYPE_PUBLIC = "public";
export const CHANNELS_TYPE_PRIVATE = "private";

type ChannelType = typeof CHANNELS_TYPE_PUBLIC | typeof CHANNELS_TYPE_PRIVATE;

const CHANNELS_BY_TYPE = {
    [CHANNELS_TYPE_PUBLIC]: [
        "public:wins",
        "public:jackpots_changes",
    ],
    [CHANNELS_TYPE_PRIVATE]: [
        "comps_award",
        "bonuses_changes",
        "freespins_changes",
        "lootboxes_changes",
        "game_limits",
        "tournaments_statuses",
        "groups_updates",
        "jackpot_win_award",
        "allsecure_notification",
        "$analytics",
        "personal_notifications",
        "tournament_notifications",
        "payments_events",
        "payments_changes",
        "payment_methods_updated",
        "balance",
    ],
} as const;

function init(bus: IBus) {
    if (!bus) {
        return;
    }

    $bus = bus;
}

function subscribeLegacyChannels(channelsType: ChannelType) {
    const client = sock;

    if (!client) {
        return;
    }

    const { getSettings } = storeToRefs(useUserInfo());
    const chanelSetting = channelsType === CHANNELS_TYPE_PRIVATE ? `#${getSettings.value?.cent.user}` : "";

    CHANNELS_BY_TYPE[channelsType].forEach((chanel) => {
        const keySubs = `${chanel}${chanelSetting}`;

        if (Object.keys(client._subs).includes(keySubs)) {
            return;
        }

        client.subscribe(keySubs, (message) => {
            $bus.$emit?.(`websocket.${chanel}`, message);
        });
    });
}

async function startLegacyFlow() {
    const { getSettings } = storeToRefs(useUserInfo());
    const settings = getSettings.value;

    if (!settings?.cent) {
        return;
    }

    sock = new CentrifugeLegacy({
        ...settings.cent,
        url: getCentrifugeUrl(settings.cent.url),
    }) as LegacyCentrifugeClient;

    subscribeLegacyChannels(CHANNELS_TYPE_PUBLIC);

    if (settings.cent.user) {
        subscribeLegacyChannels(CHANNELS_TYPE_PRIVATE);
    }

    sock.connect();

    sock.onmessage = function (response) {
        const json = JSON.parse(response.data);
        $bus.$emit?.(`websocket.${json.type}`, json);
    };
}

function buildNotificationCenterChannel({ clientName, channel, user, isPrivate }: {
    clientName: string;
    channel: string;
    user: string;
    isPrivate: boolean;
}) {
    const suffix = isPrivate ? `#${user}` : "";

    return `ws:${clientName}:${channel}${suffix}`;
}

function subscribeNotificationCenterChannels(
    client: Centrifuge,
    channelsType: ChannelType,
    settings: INotificationCenterSubscription,
) {
    const isPrivate = channelsType === CHANNELS_TYPE_PRIVATE;

    CHANNELS_BY_TYPE[channelsType].forEach((channel) => {
        const channelName = buildNotificationCenterChannel({
            clientName: settings.client_name,
            channel,
            user: settings.user,
            isPrivate,
        });

        const sub = client.newSubscription(channelName, {});

        sub.on("publication", (pub) => {
            $bus.$emit?.(`websocket.${channel}`, pub.data);
        });

        sub.subscribe();
    });
}

function stopNotificationCenterFlow() {
    if (!notificationCenterClient) {
        return;
    }

    notificationCenterClient.disconnect();
    notificationCenterClient = null;
}

function handleNotificationCenterDisconnect(client: Centrifuge) {
    if (notificationCenterClient !== client) {
        return;
    }

    stopNotificationCenterFlow();
}

async function startNotificationCenterFlow() {
    try {
        const settings = await loadNotificationCenterSubscriptionReq();

        if (!settings?.url || !settings?.token || !settings?.client_name) {
            return false;
        }

        const client = new Centrifuge(
            `${settings.url}/connection/websocket`,
            { token: settings.token },
        );

        subscribeNotificationCenterChannels(client, CHANNELS_TYPE_PUBLIC, settings);

        if (settings.user) {
            subscribeNotificationCenterChannels(client, CHANNELS_TYPE_PRIVATE, settings);
        }

        client.on("error", (err) => {
            handleNotificationCenterDisconnect(client);
            log.error("NOTIFICATION_CENTER_REALTIME_ERROR", err);
        });
        client.on("disconnected", () => handleNotificationCenterDisconnect(client));

        notificationCenterClient = client;
        client.connect();

        return true;
    } catch (err) {
        stopNotificationCenterFlow();
        log.error("START_NOTIFICATION_CENTER_REALTIME_ERROR", err);
        return false;
    }
}

async function start() {
    if (typeof location === "undefined") {
        return;
    }

    const { useMocker } = useEnvironments();

    if (useMocker) {
        return;
    }

    disconnect();

    const shouldUseNotificationCenter = await shouldUseNotificationCenterFlow();

    if (shouldUseNotificationCenter) {
        await startNotificationCenterFlow();
        return;
    }

    startLegacyFlow();
}

async function shouldUseNotificationCenterFlow() {
    const { infoProject } = storeToRefs(useCommon());

    await loadProjectInfo();

    return infoProject.value?.notification_center?.new_realtime_notifications_flow_enabled === true;
}

function disconnect() {
    if (sock?._clientID) {
        sock.disconnect();
        sock = null;
    }

    stopNotificationCenterFlow();
}

function stopBetting() {
    if (!bettingClient) {
        return;
    }

    bettingClient.disconnect();
    bettingClient = null;
}

async function startBetting(url: string) {
    try {
        stopBetting();

        const { getUserInfo } = storeToRefs(useUserInfo());
        const { getUserLocale } = storeToRefs(useMultilangStore());
        const { token, channels } = await loadSocketConnection(getUserInfo.value.user_id, getUserLocale.value);
        const [ channelItem ] = channels;

        if (!channelItem) {
            throw new Error("Socket channel is missing");
        }

        const cent = new Centrifuge(url, {
            ...token,
        });
        const sub = cent.newSubscription(channelItem.channel, {
            token: channelItem.token,
        });

        sub.on("publication", ({ data }) => {
            if (data.event_name === "bonus_issued") {
                addBonusNotificationItem(data.message.type, data.message.id);
            }
        });

        sub.subscribe();
        cent.connect();
    } catch (err) {
        log.error("BETTING_WEBSOCKET_CONNECTION", err);
    }
}
export default {
    init,
    start,
    startBetting,
};
