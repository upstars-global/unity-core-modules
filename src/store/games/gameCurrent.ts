// @ts-expect-error -- TS2307: Cannot find module '@helpers/gameImage' or its corresponding type declarations.
import { getGameImagePath } from "@helpers/gameImage";
import { defineStore } from "pinia";
import { ref } from "vue";

import type { IGame } from "../../models/game";

export const useGameCurrent = defineStore("gameCurrent", () => {
    const currentGame = ref<IGame | null>();

    // @ts-expect-error -- TS7006: Parameter 'gameData' implicitly has an 'any' type.
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
