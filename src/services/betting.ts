import { storeToRefs } from "pinia";

import { WSBettingNotificationName } from "../models/WSnotices";
import { useConfigStore } from "../store/configStore";
import { useNoticesStore } from "../store/notices";
import { loadBetBonusReq } from "./api/requests/lootbox";
import { loadWebsocketAuthorizeReq, loadWebsocketTokenReq } from "./api/requests/websocket";

export async function loadSocketConnection(user_id: string, locale: string) {
    const [ token, channels ] = await Promise.all([
        loadWebsocketTokenReq(),
        loadWebsocketAuthorizeReq(user_id, locale),
    ]);

    return {
        token,
        channels,
    };
}

export async function addBonusNotificationItem(type: string, id: string) {
    const { bettingConfig } = storeToRefs(useConfigStore());
    const { addRealTimeNotification } = useNoticesStore();
    const bonusTypesMap = bettingConfig.value?.bonusTypesMap as Record<string, string>;
    const bonus = await loadBetBonusReq(bonusTypesMap?.[type] || type, id);

    if (bonus) {
        const payload = {
            data: {
                ...bonus,
                bonusType: type,
            },
        };

        addRealTimeNotification(
            payload,
            WSBettingNotificationName.BONUS_ISSUED,
        );
    }
}
