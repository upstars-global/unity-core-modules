import { log } from "../../../controllers/Logger";
import { processGameForNewAPI } from "../../../helpers/gameHelpers";
import { http } from "../../../services/api/http";
import { useGamesProviders } from "../../../store/games/gamesProviders";
import { filterDisabledProviders } from "../../../store/games/helpers/games";
import { useRootStore } from "../../../store/root";

export async function loadFoundGames(searchString: string) {
    try {
        const { isMobile } = useRootStore();
        const { disabledGamesProviders } = useGamesProviders();

        const { data } = await http().post("/api/games_filter", {
            device: isMobile ? "mobile" : "desktop",
            filter: {
                title: searchString,
            },
        });

        return filterDisabledProviders(data.data.map(processGameForNewAPI), disabledGamesProviders);
    } catch (err) {
        log.error("LOAD_FOUND_GAMES_ERROR", err);
    }
}
