import { defineStore, storeToRefs } from "pinia";

import { log } from "../../controllers/Logger";
import { processGameForNewAPI } from "../../helpers/gameHelpers";
import { http } from "../../services/api/http";
import { useRootStore } from "../root";
import { filterDisabledProviders } from "./helpers/games";

export const useGamesSearch = defineStore("gamesSearch", () => {
    async function loadFoundGames(searchString: string) {
        const { isMobile } = storeToRefs(useRootStore());
        try {
            const { data } = await http().post("/api/games_filter", {
                device: isMobile.value ? "mobile" : "desktop",
                filter: {
                    title: searchString,
                },
            });
            return filterDisabledProviders(data.data.map(processGameForNewAPI));
        } catch (err) {
            log.error("LOAD_FOUND_GAMES_ERROR", err);
        }
    }

    return {
        loadFoundGames,
    };
});
