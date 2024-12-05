import { defineStore } from "pinia";
import { ref } from "vue";

import log from "../../controllers/Logger";
import { http } from "../../services/api/http";

export const userGamesHistory = defineStore(
    "userGamesHistory",
    () => {
        const gamesHistory = ref([]);

        async function loadUserGameHistory() {
            try {
                const { data } = await http().get("/api/player/games");
                gamesHistory.value = data;
            } catch (err) {
                log.error("LOAD_USER_GAMES_HISTORY", err);
            }
        }

        return {
            gamesHistory,
            loadUserGameHistory,
        };
    });
