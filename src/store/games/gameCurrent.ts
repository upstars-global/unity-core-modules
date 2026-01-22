import { defineStore } from "pinia";
import { ref } from "vue";

import { log } from "../../controllers/Logger";
import type { IGame } from "../../models/game";
import { http } from "../../services/api/http";
import { useConfigStore } from "../configStore";
import { useGamesCommon } from "./gamesStore";
import { findGameBySeoTittleAndProducer } from "./helpers/games";

export const useGameCurrent = defineStore("gameCurrent", () => {
    const { $defaultProjectConfig } = useConfigStore();
    const { getGameImagePath } = $defaultProjectConfig;
    const { setGameToCache, getGameFromCache } = useGamesCommon();
    const currentGame = ref<IGame | null>();

    function setToCurrentGame(gameData) {
        if (gameData?.identifier) {
            currentGame.value = {
                ...gameData,
                preview: getGameImagePath(gameData.identifier),
            };

            return gameData;
        }
        return gameData;
    }

    async function loadGameBySeoTitle(seoTitle: string, producer: string, restrict: boolean = false): Promise<IGame> {
        const gameFromCache = getGameFromCache({ seoTitle, producer });
        if (gameFromCache) {
            return setToCurrentGame(gameFromCache);
        }

        try {
            const { data }: Record<string, IGame[]> = await http().post("/api/games_filter/select_by_seo_titles", {
                without_territorial_restrictions: restrict,
                game_seo_titles: [ seoTitle ],
            });
            const dataToArray = Object.values(data);
            const gameData = findGameBySeoTittleAndProducer(dataToArray, { seoTitle, producer }) || dataToArray[0];

            setGameToCache(gameData);
            return setToCurrentGame(gameData);
        } catch (err) {
            log.error("LOAD_GAME_BY_SEO_TITLE", err);
            throw err;
        }
    }

    async function loadGameBySlug(slug: string): Promise<IGame> {
        const gameInCache = getGameFromCache({ identifier: slug });
        if (gameInCache) {
            return setToCurrentGame(gameInCache);
        }

        try {
            const { data }: Record<string, IGame> = await http().post("/api/games_filter/select", {
                game_ids: [ slug ],
            });

            const gameData = Object.values(data)[0];
            if (gameData) {
                setGameToCache(gameData);
                return setToCurrentGame(gameData);
            }
        } catch (err) {
            log.error("LOAD_GAME_BY_SLUG", err);
            throw err;
        }
    }

    function clearCurrentGame(): void {
        currentGame.value = null;
    }

    return {
        currentGame,

        loadGameBySeoTitle,
        loadGameBySlug,

        clearCurrentGame,
    };
});
