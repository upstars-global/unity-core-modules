import { getGameImagePath } from "@helpers/gameImage";
import { defineStore } from "pinia";
import { ref } from "vue";

import type { IGame } from "../../models/game";

export const useGameCurrent = defineStore("gameCurrent", () => {
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

    function clearCurrentGame(): void {
        currentGame.value = null;
    }

    return {
        currentGame,
        setToCurrentGame,
        clearCurrentGame,
    };
});
