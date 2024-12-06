import { useUserInfo } from "@store/user/userInfo";
import { defineStore, storeToRefs } from "pinia";
import { computed, ref } from "vue";

interface ISanitizedUserData {
    externalId: string;
    email?: string;
    firstName?: string | null | undefined;
    lastName?: string | null | undefined;
    phone?: string;
}

interface IFreshChatData {
    pending: any;
    restoreId: any;
    externalId?: string;
    widgetUuid: string;
    token: string;
}

export function createFreshChatStore(config: Record<string, unknown>) {
    return defineStore("freshchatStore", () => {

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
                    externalId: `${ id }`,
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
                getDataIsLoaded: isLoaded
            } = storeToRefs(useUserInfo());

            const externalId = userInfo.value.id;

            return {
                token: config.freshChat.token,
                widgetUuid: config.freshChat.widgetUuid,
                // restore have no impact without externalId
                restoreId: externalId ? restoreId.value : undefined,
                // externalId cause generating new restoreId, so we need wait initializing
                // our saved restoreId to prevent overriding
                externalId: restoreIdLoaded.value? externalId : undefined,
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
}
