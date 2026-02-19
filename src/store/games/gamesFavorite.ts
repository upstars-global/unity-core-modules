import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { type IGameItem } from "../../helpers/gameHelpers";
import type { GameFavoriteIds } from "../../models/game";

export const useGamesFavorite = defineStore("gamesFavorite", () => {
    const favoritesId = ref<GameFavoriteIds>([]);
    const gamesFavoriteFullData = ref<IGameItem[]>([]);

    const gamesFavoriteID = computed<GameFavoriteIds>(() => [ ...favoritesId.value ].reverse());

    const getGamesFavoriteFullData = computed(() => [ ...gamesFavoriteFullData.value ].reverse());

    function clearUserData() {
        favoritesId.value = [];
        gamesFavoriteFullData.value = [];
    }

    function setFavoritesId(ids: GameFavoriteIds) {
        favoritesId.value = ids;
    }

    function setGamesFavoriteFullData(games: IGameItem[]) {
        gamesFavoriteFullData.value = games;
    }

    return {
        gamesFavoriteID,
        gamesFavoriteFullData,
        favoritesId,
        getGamesFavoriteFullData,
        setFavoritesId,
        setGamesFavoriteFullData,
        clearUserData,
    };
});
