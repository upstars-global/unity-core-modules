import { storeToRefs } from "pinia";
import { useGamesProviders } from "src/store/games/gamesProviders";
import { useGamesCommon } from "src/store/games/gamesStore";

import { log } from "../../../controllers/Logger";
import { processGameForNewAPI } from "../../../helpers/gameHelpers";
import { filterGames } from "../../../helpers/gameHelpers";
import { useRootStore } from "../../../store/root";
import { http } from "../http";

export async function loadFoundGames(searchString: string) {
    try {
        const { isMobile } = useRootStore();
        const { disabledGamesProviders } = storeToRefs(useGamesProviders());
        const { enabledGamesConfig } = storeToRefs(useGamesCommon());

        const { data } = await http().post("/api/games_filter", {
            device: isMobile ? "mobile" : "desktop",
            filter: {
                title: searchString,
            },
        });

        return filterGames(
            data.data.map(processGameForNewAPI),
            disabledGamesProviders.value,
            enabledGamesConfig.value,
        );
    } catch (err) {
        log.error("LOAD_FOUND_GAMES_ERROR", err);
    }
}
