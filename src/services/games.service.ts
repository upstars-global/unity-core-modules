import { SlugCategoriesGames } from "../consts/games";
import { log } from "../controllers/Logger";
import { useGamesCommon } from "../store/games/gamesStore";
import { useJackpots } from "../store/jackpots";
import { http } from "./api/http";

export function getMenuCategoriesBySlug(slug: string): SlugCategoriesGames[] {
    const jackpotsStore = useJackpots();
    const gamesStore = useGamesCommon();

    const isTurnOnJPMystic = jackpotsStore.jackpotsActiveList.some(({ identifier }) => {
        return identifier === SlugCategoriesGames.SLUG_CATEGORY_MYSTIC_JACKPOTS;
    });
    return (
        gamesStore.menuGameCategories[slug] ||
        gamesStore.defaultMenuGameCategories[slug]
    ).filter((slug1: string) => (slug1 === SlugCategoriesGames.SLUG_CATEGORY_MYSTIC_JACKPOTS ? isTurnOnJPMystic : true));
}

export async function loadCategoriesFileConfig() {
    const gamesStore = useGamesCommon();
    if (gamesStore.menuGameCategories) {
        return gamesStore.menuGameCategories;
    }

    try {
        const { data } = await http().get<Record<string, SlugCategoriesGames[]>>("/api/fe/config/menu-categories-games");
        gamesStore.setMenuGameCategories(data);

        return data;
    } catch (err) {
        log.error("LOAD_CATEGORIES_PAGE_FILE_CONFIG_ERROR", err);
        throw err;
    }
}
