import { log } from "../../../controllers/Logger";
import { processGameForNewAPI } from "../../../helpers/gameHelpers";
import { filterGames } from "../../../store/games/helpers/games";
import { useRootStore } from "../../../store/root";
import { http } from "../http";

export async function loadFoundGames(searchString: string) {
    try {
        const { isMobile } = useRootStore();

        const { data } = await http().post("/api/games_filter", {
            device: isMobile ? "mobile" : "desktop",
            filter: {
                title: searchString,
            },
        });

        return filterGames(data.data.map(processGameForNewAPI));
    } catch (err) {
        log.error("LOAD_FOUND_GAMES_ERROR", err);
    }
}
