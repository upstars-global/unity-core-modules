import { WSBettingNotificationName } from "../models/WSnotices";
import { useNoticesStore } from "../store/notices";
import { loadBetBonusReq } from "./api/requests/lootbox";
import { loadWebsocketAuthorizeReq, loadWebsocketTokenReq } from "./api/requests/websocket";

export enum BonusTypes {
    freebet_only_win = "freebets",
    hunting = "huntings",
    lootbox = "lootboxes",
    comboboost = "comboboosts"
}
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
    const { addRealTimeNotification } = useNoticesStore();
    const bonus = await loadBetBonusReq(BonusTypes[type], id);
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
