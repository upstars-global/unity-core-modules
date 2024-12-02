import { defineStore } from "pinia";
import { ref } from "vue";

import { http } from "../../services/api/http";
import log from "../../controllers/Logger";

export const userGamesHistory = defineStore(
    "userGamesHistory",
    () => {
        let gamesHistory = ref([]);

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
