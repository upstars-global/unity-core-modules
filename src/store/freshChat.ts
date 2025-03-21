import config from "@theme/configs/config";
import { PROJECT } from "@theme/configs/constantsFreshChat";
import { defineStore, storeToRefs } from "pinia";
import { computed, ref } from "vue";

import { useUserInfo } from "./user/userInfo";

interface ISanitizedUserData {
    externalId: string;
    email?: string;
    firstName?: string | null | undefined;
    lastName?: string | null | undefined;
    phone?: string;
}

interface IFreshChatData {
    pending: unknown;
    restoreId: unknown;
    externalId?: string;
    widgetUuid: string;
    token: string;
}

export const useFreshChatStore = defineStore("freshchatStore", () => {
    const newMessagesCount = ref(0);

    const getMessagesCount = computed(() => {
        return newMessagesCount.value;
    });

    function setNewMessageCount(count: number) {
        newMessagesCount.value = count;
    }

    const { getUserInfo: userInfo } = storeToRefs(useUserInfo());

    const userData = computed<ISanitizedUserData | null>(() => {
        const { id, mobile_phone, email, first_name, last_name } = userInfo.value;
        if (id) {
            return {
                externalId: `${ PROJECT }-${ id }`,
                email,
                firstName: first_name,
                lastName: last_name,
                phone: mobile_phone,
            };
        }
        return null;
    });

    const freshChatData = computed<IFreshChatData>(() => {
        const {
            getFreshChatRestoreId: restoreId,
            getFreshChatRestoreIdLoaded: restoreIdLoaded,
            getDataIsLoaded: isLoaded,
        } = storeToRefs(useUserInfo());

        const externalId = userInfo.value.id;

        return {
            token: config.freshChat.token,
            widgetUuid: config.freshChat.widgetUuid,
            // restore have no impact without externalId
            restoreId: externalId ? restoreId.value : undefined,
            // externalId cause generating new restoreId, so we need wait initializing
            // our saved restoreId to prevent overriding
            externalId: restoreIdLoaded.value && externalId ? `${ PROJECT }-${ externalId }` : null,
            ...(userData.value || {}),
            pending: isLoaded.value && !restoreIdLoaded.value,
        };
    });

    return {
        getMessagesCount,
        setNewMessageCount,
        userData,
        freshChatData,
    };
});
