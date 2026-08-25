
import { defineStore } from "pinia";
import { computed } from "vue";

import { useLevelsStore } from "./levels/levelsStore";

const RESERVE_CHAT_GROUP_ID = "reserve_chat";

export const CHAT_LIVECHAT = "liveChat";
export const DEFAULT_CHAT = "freshChat";
export const RESERVE_CHAT = CHAT_LIVECHAT;

export const useEnabledChatStore = defineStore("enabledChatStore", () => {
    const enabledChat = computed(() => {
        const levelsStore = useLevelsStore();

        if (levelsStore.groups.length) {
            const isEnableReserveChat = levelsStore.groups.find(({ id }) => {
                return id === RESERVE_CHAT_GROUP_ID;
            });
            return isEnableReserveChat?.writable ? RESERVE_CHAT : DEFAULT_CHAT;
        }

        return null;
    });

    return {
        enabledChat,
    };
});
