import log from "../../../controllers/Logger";
import { INotificationCenterSubscription } from "../DTO/notificationCenter";
import { http } from "../http";

export async function loadNotificationCenterSubscriptionReq(): Promise<INotificationCenterSubscription | undefined> {
    try {
        const { data } = await http().get<INotificationCenterSubscription>(
            "/api/notification_center/centrifugo/subscription",
        );

        return data;
    } catch (err) {
        log.error("LOAD_NOTIFICATION_CENTER_SUBSCRIPTION_ERROR", err);
    }
}
