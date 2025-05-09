import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import { log } from "../../../src/controllers/Logger";
import { IGameItem, processGame } from "../../../src/helpers/gameHelpers";
import { IGame } from "../../../src/models/game";
import { AcceptsGamesVariants } from "../../../src/services/api/DTO/gamesDTO";
import {
    fetchAddFavoriteGamesCount,
    fetchDeleteGameFromFavorites,
    fetchFavoriteGames,
} from "../../../src/services/api/requests/games";
import { useGamesFavorite } from "../../../src/store/games/gamesFavorite";

vi.mock("../../../src/controllers/Logger", () => ({
    log: { error: vi.fn() },
}));
vi.mock("../../../src/helpers/gameHelpers", () => ({
    processGame: vi.fn((game, id) => ({ ...game, processed: true, id })),
}));
vi.mock("../../../src/services/api/requests/games", () => ({
    fetchFavoriteGames: vi.fn(),
    fetchAddFavoriteGamesCount: vi.fn(),
    fetchDeleteGameFromFavorites: vi.fn(),
}));


const mockFetchFavorite = vi.mocked(fetchFavoriteGames);
const mockFetchAddFavorite = vi.mocked(fetchAddFavoriteGamesCount);
const mockFetchDelFavorite = vi.mocked(fetchDeleteGameFromFavorites);

describe("useGamesFavorite", () => {
    const MOCK_ID = 123;
    const MOCK_IDS = [ 101, 102 ];
    const MOCK_FULL = [
        { identifier: "game1", title: "Game 1" } as IGame,
        { identifier: "game2", title: "Game 2" } as IGame,
    ];

    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    it("should initialize with default values", () => {
        const store = useGamesFavorite();
        expect(store.favoritesId).toEqual([]);
        expect(store.gamesFavoriteFullData).toEqual([]);
        expect(store.gamesFavoriteID).toEqual([]);
        expect(store.getGamesFavoriteFullData).toEqual([]);
    });

    it("should load favorite games successfully", async () => {
        mockFetchFavorite
            .mockResolvedValueOnce(MOCK_FULL) // fullData
            .mockResolvedValueOnce(MOCK_IDS); // onlyID

        const store = useGamesFavorite();
        await store.loadFavoriteGames();

        expect(mockFetchFavorite).toHaveBeenCalledWith(AcceptsGamesVariants.fullData);
        expect(mockFetchFavorite).toHaveBeenCalledWith(AcceptsGamesVariants.onlyID);
        expect(processGame).toHaveBeenCalledTimes(2);
        expect(store.favoritesId).toEqual(MOCK_IDS);
        expect(store.gamesFavoriteFullData).toEqual([
            { ...MOCK_FULL[0], processed: true, id: "game1" },
            { ...MOCK_FULL[1], processed: true, id: "game2" },
        ]);
    });

    it("should handle error when loading favorite games", async () => {
        const error = new Error("API error");
        mockFetchFavorite.mockRejectedValue(error);

        const store = useGamesFavorite();
        await expect(store.loadFavoriteGames()).rejects.toThrow(error);
        expect(log.error).toHaveBeenCalledWith("LOAD_FAVORITE_GAMES_ERROR", error);
    });

    it("should add game to favorites successfully", async () => {
        mockFetchAddFavorite.mockResolvedValue(undefined);
        mockFetchFavorite
            .mockResolvedValueOnce(MOCK_FULL)
            .mockResolvedValueOnce([ MOCK_ID ]);

        const store = useGamesFavorite();
        await store.addGameToFavorites(MOCK_ID);

        expect(mockFetchAddFavorite).toHaveBeenCalledWith(MOCK_ID);
        expect(mockFetchFavorite).toHaveBeenCalledTimes(2);
        expect(store.favoritesId).toEqual([ MOCK_ID ]);
    });

    it("should handle error when adding game to favorites", async () => {
        const error = new Error("API error");
        mockFetchAddFavorite.mockRejectedValue(error);

        const store = useGamesFavorite();
        await expect(store.addGameToFavorites(MOCK_ID)).rejects.toThrow(error);
        expect(mockFetchAddFavorite).toHaveBeenCalledWith(MOCK_ID);
    });

    it("should delete game from favorites successfully", async () => {
        mockFetchDelFavorite.mockResolvedValue(undefined);

        const store = useGamesFavorite();
        store.favoritesId = [ MOCK_ID, 102 ];
        store.gamesFavoriteFullData = [
            { currencies: { USD: { id: MOCK_ID }, EUR: { id: 999 } } },
        ] as unknown as IGameItem[];

        await store.deleteGameFromFavorites(MOCK_ID);

        expect(mockFetchDelFavorite).toHaveBeenCalledWith(MOCK_ID);
        expect(store.favoritesId).toEqual([ 102 ]);
        expect(store.gamesFavoriteFullData).toEqual([]);
    });

    it("should handle error when deleting game from favorites", async () => {
        const error = new Error("API error");
        mockFetchDelFavorite.mockRejectedValue(error);

        const store = useGamesFavorite();
        await expect(store.deleteGameFromFavorites(MOCK_ID)).rejects.toThrow(error);
        expect(mockFetchDelFavorite).toHaveBeenCalledWith(MOCK_ID);
    });

    it("should clear user data", () => {
        const store = useGamesFavorite();
        store.favoritesId = [ 1 ];
        store.gamesFavoriteFullData = [ { identifier: "game1", currencies: {} } ] as IGameItem[];

        store.clearUserData();
        expect(store.favoritesId).toEqual([]);
        expect(store.gamesFavoriteFullData).toEqual([]);
    });

    it("should return reversed favorites IDs", () => {
        const store = useGamesFavorite();
        store.favoritesId = [ 1, 2 ];
        store.gamesFavoriteFullData = [ { identifier: "a" }, { identifier: "b" } ] as IGameItem[];

        expect(store.gamesFavoriteID).toEqual([ 2, 1 ]);
        expect(store.getGamesFavoriteFullData).toEqual([
            { identifier: "b" },
            { identifier: "a" },
        ]);
    });
});
