import type { AxiosResponse } from "axios";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { log } from "../../controllers/Logger";
import { type IGameItem, processGame } from "../../helpers/gameHelpers";
import type { GameFavoriteIds, IGame } from "../../models/game";
import { http } from "../../services/api/http";

export const useGamesFavorite = defineStore("gamesFavorite", () => {
    const favoritesId = ref<GameFavoriteIds>([]);
    const gamesFavoriteFullData = ref<IGameItem[]>([]);

    const gamesFavoriteID = computed<GameFavoriteIds>(() => [ ...favoritesId.value ].reverse());

    async function loadFavoriteGames() {
        try {
            const favoriteGameHeaderFullData = { "accept-client": "application/vnd.s.v2+json" };
            const favoriteGameHeaderId = { "accept-client": "application/vnd.s.v1+json" };

            const [
                gamesFullData,
                gamesID,
            ] = await Promise.all(
                [
                    favoriteGameHeaderFullData,
                    favoriteGameHeaderId,
                ].map((headers) => {
                    return http({ headers }).get("/api/player/favorite_games");
                }),
            ) as [ AxiosResponse<IGame[]>, AxiosResponse<number[]> ];

            favoritesId.value = gamesID.data;
            gamesFavoriteFullData.value = gamesFullData.data
                .map((game) => processGame(game, game.identifier));
        } catch (err) {
            log.error("LOAD_FAVORITE_GAMES_ERROR", err);
            throw err;
        }
    }

    async function addGameToFavorites(idGame: number): Promise<void> {
        try {
            await http({ auth: true }).put(`/api/player/favorite_games/${idGame}`);
            await loadFavoriteGames();
        } catch (err) {
            log.error("ADD_GAME_TO_FAVORITES_ERROR", err);
            throw err;
        }
    }

    async function deleteGameFromFavorites(idGame: number) {
        try {
            await http().delete(`/api/player/favorite_games/${idGame}`);

            favoritesId.value = favoritesId.value.filter((idFavorite) => idFavorite !== idGame);
            gamesFavoriteFullData.value = gamesFavoriteFullData.value.filter((gameFavorite) => {
                return !Object.values(gameFavorite.currencies).some(({ id }) => id === idGame);
            });
        } catch (err) {
            log.error("DELETE_GAME_FROM_FAVORITES_ERROR", err);
            throw err;
        }
    }

    const getGamesFavoriteFullData = computed(() => [ ...gamesFavoriteFullData.value ].reverse());

    function clearUserData() {
        favoritesId.value = [];
        gamesFavoriteFullData.value = [];
    }

    return {
        gamesFavoriteID,
        gamesFavoriteFullData,

        getGamesFavoriteFullData,

        loadFavoriteGames,
        addGameToFavorites,
        deleteGameFromFavorites,

        clearUserData,
    };
});
