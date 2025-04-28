import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { log } from "../../controllers/Logger";
import { type IGameItem, processGame } from "../../helpers/gameHelpers";
import type { GameFavoriteIds } from "../../models/game";
import { AcceptsGamesVariants } from "../../services/api/DTO/gamesDTO";
import {
    fetchAddFavoriteGamesCount,
    fetchDeleteGameFromFavorites,
    fetchFavoriteGames,
} from "../../services/api/requests/games";

export const useGamesFavorite = defineStore("gamesFavorite", () => {
    const favoritesId = ref<GameFavoriteIds>([]);
    const gamesFavoriteFullData = ref<IGameItem[]>([]);

    const gamesFavoriteID = computed<GameFavoriteIds>(() => [ ...favoritesId.value ].reverse());

    async function loadFavoriteGames() {
        try {
            const [
                gamesFullData,
                gamesID,
            ] = await Promise.all([
                fetchFavoriteGames(AcceptsGamesVariants.fullData),
                fetchFavoriteGames(AcceptsGamesVariants.onlyID),
            ]);

            favoritesId.value = gamesID;
            gamesFavoriteFullData.value = gamesFullData
                .map((game) => processGame(game, game.identifier));
        } catch (err) {
            log.error("LOAD_FAVORITE_GAMES_ERROR", err);
            throw err;
        }
    }

    async function addGameToFavorites(idGame: number): Promise<void> {
        await fetchAddFavoriteGamesCount(idGame);
        await loadFavoriteGames();
    }

    async function deleteGameFromFavorites(idGame: number) {
        await fetchDeleteGameFromFavorites(idGame);

        favoritesId.value = favoritesId.value.filter((idFavorite) => idFavorite !== idGame);
        gamesFavoriteFullData.value = gamesFavoriteFullData.value.filter((gameFavorite) => {
            return !Object.values(gameFavorite.currencies).some(({ id }) => id === idGame);
        });
    }

    const getGamesFavoriteFullData = computed(() => [ ...gamesFavoriteFullData.value ].reverse());

    function clearUserData() {
        favoritesId.value = [];
        gamesFavoriteFullData.value = [];
    }

    return {
        gamesFavoriteID,
        gamesFavoriteFullData,
        favoritesId,

        getGamesFavoriteFullData,

        loadFavoriteGames,
        addGameToFavorites,
        deleteGameFromFavorites,

        clearUserData,
    };
});
