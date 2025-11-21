import { SlugCategoriesGames } from "@theme/configs/categoryesGames";

import { useGamesCommon } from "../store/games/gamesStore";
import { useJackpots } from "../store/jackpots";
import { loadEnabledGamesConfigReq } from "./api/requests/configs";
import { loadCategoriesFileConfigRequest } from "./api/requests/games";

export function getMenuCategoriesBySlug(slug: string): SlugCategoriesGames[] {
    const jackpotsStore = useJackpots();
    const gamesStore = useGamesCommon();

    return (
        gamesStore.menuGameCategories[slug] ||
    gamesStore.defaultMenuGameCategories[slug]
    ).filter((menuSlug: string) =>
        (menuSlug === SlugCategoriesGames.SLUG_CATEGORY_MYSTIC_JACKPOTS ? jackpotsStore.isTurnOnJPMystic : true));
}

export async function loadCategoriesFileConfig() {
    const gamesStore = useGamesCommon();

    if (Object.keys(gamesStore.menuGameCategories).length > 0) {
        return gamesStore.menuGameCategories;
    }

    const data = await loadCategoriesFileConfigRequest();

    if (data) {
        gamesStore.setMenuGameCategories(data);
    }
}

export async function loadEnableGamesConfig() {
    const gamesStore = useGamesCommon();
    const data = await loadEnabledGamesConfigReq();

    if (data) {
        gamesStore.setEnableGamesConfig(data);
    }
}
