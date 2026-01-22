import { defineStore } from "pinia";
import { computed } from "vue";

import { useConfigStore } from "./configStore";
import { useLevelsStore } from "./levels/levelsStore";

export const CHAT_LIVECHAT = "liveChat";
export const DEFAULT_CHAT = "freshChat";
export const RESERVE_CHAT = CHAT_LIVECHAT;

export const useEnabledChatStore = defineStore("enabledChatStore", () => {
    const { $defaultProjectConfig } = useConfigStore();
    const enabledChat = computed(() => {
        const levelsStore = useLevelsStore();

        if (levelsStore.groups.length) {
            const isEnableReserveChat = levelsStore.groups.find(({ id }) => {
                return Number(id) === $defaultProjectConfig.CHAT_ID;
            });
            return isEnableReserveChat?.writable ? RESERVE_CHAT : DEFAULT_CHAT;
        }

        return null;
    });

    return {
        enabledChat,
    };
});
