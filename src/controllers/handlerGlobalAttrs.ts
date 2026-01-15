import toast from "@plugins/Toast";
import { onBeforeUnmount, onMounted } from "vue";
import { useI18n } from "vue-i18n";

import { putUserSubscription } from "../services/user";
import { useUserInfo } from "../store/user/userInfo";
import { log } from "./Logger";

export function useGlobalHandler(): void {
    const userStore = useUserInfo();
    const $useI18n = useI18n();

    async function reqReceivePromo(): Promise<void> {
        // @ts-expect-error Property 'receive_promos' does not exist
        const { receive_promos } = userStore.getUserSubscriptions;

        if (receive_promos) {
            toast.show({
                image: "message",
                text: $useI18n.t("NOTIFICATIONS.SUCCESS_ALREADY_SUBSCRIBED_PROMO"),
                id: Date.now(),
                type: "message",
            });
            return;
        }

        try {
            await putUserSubscription({ subscription_params: { receive_promos: true } });
            toast.show({
                text: $useI18n.t("NOTIFICATIONS.SUCCESS_RECAEVED_PROMO"),
                id: Date.now(),
                image: "successfully",
                type: "successfully",
            });
        } catch (err) {
            toast.show({
                type: "warning",
                image: "warning",
                text: $useI18n.t("NOTIFICATIONS.SOMETHING_WENT_WRONG"),
                id: Date.now(),
            });

            log.error("REQ_RECEIVE_PROMO_ERROR", err);
        }
    }

    function handlerReceivePromo(event: MouseEvent): void {
        const target = (event.target as Element)?.closest("[data-action='subscription-to-promo']");
        if (target) {
            reqReceivePromo();
        }
    }

    onMounted(() => {
        document.addEventListener("click", handlerReceivePromo);
    });

    onBeforeUnmount(() => {
        document.removeEventListener("click", handlerReceivePromo);
    });
}
