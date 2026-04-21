import { getCentrifugeUrl } from "@config/centrifuge";
import Centrifuge from "centrifuge/centrifuge";
import { storeToRefs } from "pinia";

import { useEnvironments } from "../store/environments";
import { useUserInfo } from "../store/user/userInfo";

let sock = {},
    $bus = {};


export const CHANNELS_TYPE_PUBLIC = "public";
export const CHANNELS_TYPE_PRIVATE = "private";

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
};

function init(bus) {
    if (!bus) {
        return;
    }

    $bus = bus;
}

function subscribe(channelsType) {
    const { getSettings } = storeToRefs(useUserInfo());
    const chanelSetting = channelsType === CHANNELS_TYPE_PRIVATE ? `#${ getSettings.value.cent.user }` : "";
    CHANNELS_BY_TYPE[channelsType].forEach((chanel) => {
        const keySubs = `${ chanel }${ chanelSetting }`;
        if (Object.keys(sock._subs).includes(keySubs)) {
            return;
        }
        sock.subscribe(keySubs, (message) => {
            $bus.$emit(`websocket.${ chanel }`, message);
        });
    });
}

async function start() {
    if (typeof location === "undefined") {
        return;
    }
    const { getSettings } = storeToRefs(useUserInfo());

    const settings = getSettings.value;
    const { useMocker } = useEnvironments();


    if (!settings || !settings.cent || useMocker) {
        return;
    }

    if (sock._clientID) {
        sock.disconnect();
        sock = {};
    }

    sock = new Centrifuge({
        ...settings.cent,
        // url: getCentrifugeUrl(settings.cent.url),
    });
    subscribe(CHANNELS_TYPE_PUBLIC);

    if (settings.cent.user) {
        subscribe(CHANNELS_TYPE_PRIVATE);
    }

    sock.connect();

    sock.onmessage = function (response) {
        const json = JSON.parse(response.data);
        $bus.$emit(`websocket.${ json.type }`, json);
    };
}

export default {
    init,
    start,
    subscribe,
};
