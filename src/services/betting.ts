import { useNoticesStore } from "../store/notices";
import { loadBetBonusReq } from "./api/requests/lootbox";
import { loadWebsocketAuthorizeReq, loadWebsocketTokenReq } from "./api/requests/websocket";

export enum WSBettingNotificationName {
    BONUS_ISSUED = "bonus_issued"
}

export enum BonusTypes {
    freebet_only_win = "freebets",
    hunting = "huntings",
    lootbox = "lootboxes",
    comboboost = "comboboosts"
}
export function useBettingService() {
    async function loadSocketConnection(user_id: string, locale: string) {
        const [ token, channels ] = await Promise.all([
            loadWebsocketTokenReq(),
            loadWebsocketAuthorizeReq(user_id, locale),
        ]);

        return {
            token,
            channels,
        };
    }

    async function addBonusNotificationItem(type: string, id: string) {
        const { addRealTimeNotification } = useNoticesStore();
        const bonus = await loadBetBonusReq(BonusTypes[type], id);
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


    return {
        loadSocketConnection,
        addBonusNotificationItem,
    };
}
