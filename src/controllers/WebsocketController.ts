import { getCentrifugeUrl } from "@config/centrifuge";
import { Centrifuge } from "centrifuge";
import CentrifugeLegacy from "centrifuge-legacy/centrifuge";
import { storeToRefs } from "pinia";

import log from "../controllers/Logger";
import { type INotificationCenterSubscription } from "../services/api/DTO/notificationCenter";
import { loadNotificationCenterSubscriptionReq } from "../services/api/requests/notificationCenter";
import { loadProjectInfo } from "../services/common";
import { useCommon } from "../store/common";
import { useEnvironments } from "../store/environments";
import { useUserInfo } from "../store/user/userInfo";

let sock: LegacyCentrifugeClient | null = null;
let notificationCenterClient: Centrifuge | null = null;
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

        sub.on("publication", (ctx) => {
            $bus.$emit?.(`websocket.${channel}`, ctx.data);
        });

        sub.subscribe();
    });
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

        client.connect();
        notificationCenterClient = client;

        return true;
    } catch (err) {
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

    const shouldUseNotificationCenter = false;// await shouldUseNotificationCenterFlow();

    if (shouldUseNotificationCenter) {
        const isStarted = await startNotificationCenterFlow();

        if (isStarted) {
            return;
        }
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
    }

    if (notificationCenterClient) {
        notificationCenterClient.disconnect();
    }

    sock = null;
    notificationCenterClient = null;
}

export default {
    init,
    start,
};
