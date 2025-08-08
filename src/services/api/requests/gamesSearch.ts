import { log } from "../../../controllers/Logger";
import { processGameForNewAPI } from "../../../helpers/gameHelpers";
import { http } from "../../../services/api/http";

export async function loadFoundGames(searchString: string, isMobile: boolean) {
    try {
        const { data } = await http().post("/api/games_filter", {
            device: isMobile ? "mobile" : "desktop",
            filter: {
                title: searchString,
            },
        });

        return data.data.map(processGameForNewAPI);
    } catch (err) {
        log.error("LOAD_FOUND_GAMES_ERROR", err);
    }
}
