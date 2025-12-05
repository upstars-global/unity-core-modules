import { defineStore } from "pinia";
import { ref } from "vue";

import type { IUserGameHistoryItem } from "../../models/user";

export const userGamesHistory = defineStore(
    "userGamesHistory",
    () => {
        const gamesHistory = ref<IUserGameHistoryItem[]>([]);

        function setGamesHistory(history: IUserGameHistoryItem[]) {
            gamesHistory.value = history;
        }

        return {
            gamesHistory,
            setGamesHistory,
        };
    });
