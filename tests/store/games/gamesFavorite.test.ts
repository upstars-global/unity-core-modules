import { type AxiosInstance } from "axios";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { log } from "../../../src/controllers/Logger";
import { type IGameItem, processGame } from "../../../src/helpers/gameHelpers";
import { http } from "../../../src/services/api/http";
import { useGamesFavorite } from "../../../src/store/games/gamesFavorite";


const MOCK_FAVORITE_GAME_ID = 123;
const MOCK_GAMES_ID = [ 101, 102 ];


// Mock dependencies
vi.mock("../../../src/services/api/http", () => ({
    http: vi.fn((config) => ({
        get: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        config,
    })),
}));

vi.mock("../../../src/controllers/Logger", () => ({
    log: {
        error: vi.fn(),
    },
}));

vi.mock("../../../src/helpers/gameHelpers", () => ({
    processGame: vi.fn((game, id) => ({ ...game, processed: true, id })),
}));

describe("useGamesFavorite", () => {
    const mockHttp = {
        get: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        config: undefined,
    };

    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();

        // Reset mock implementation for http
        (http as unknown as ReturnType<typeof vi.fn>).mockImplementation((config) => {
            mockHttp.config = config;
            return mockHttp;
        });
    });

    it("should initialize with default values", () => {
        const store = useGamesFavorite();

        expect(store.gamesFavoriteID).toEqual([]);
        expect(store.gamesFavoriteFullData).toEqual([]);
        expect(store.getGamesFavoriteFullData).toEqual([]);
    });

    it("should load favorite games successfully", async () => {
        const mockGamesFullData = {
            data: [
                { identifier: "game1", title: "Game 1" },
                { identifier: "game2", title: "Game 2" },
            ],
        };

        const mockGamesID = {
            data: MOCK_GAMES_ID,
        };

        mockHttp.get.mockImplementation(async (url) => {
            if (url === "/api/player/favorite_games") {
                // Return different responses based on headers
                const headers = mockHttp.config?.headers;
                if (headers?.["accept-client"] === "application/vnd.s.v2+json") {
                    return mockGamesFullData;
                } else if (headers?.["accept-client"] === "application/vnd.s.v1+json") {
                    return mockGamesID;
                }
            }
            return { data: [] };
        });

        const store = useGamesFavorite();
        await store.loadFavoriteGames();

        // Verify http was called with correct parameters
        expect(http).toHaveBeenCalledWith({
            headers: { "accept-client": "application/vnd.s.v2+json" },
        });
        expect(mockHttp.get).toHaveBeenCalledWith("/api/player/favorite_games");

        // Verify state was updated correctly
        expect(store.gamesFavoriteID).toEqual(MOCK_GAMES_ID.reverse());
        expect(processGame).toHaveBeenCalledTimes(2);
        expect(processGame).toHaveBeenCalledWith(
            { identifier: "game1", title: "Game 1" },
            "game1",
        );
    });

    it("should handle error when loading favorite games", async () => {
        const error = new Error("API error");
        mockHttp.get.mockRejectedValue(error);

        const store = useGamesFavorite();

        await expect(store.loadFavoriteGames()).rejects.toThrow("API error");
        expect(log.error).toHaveBeenCalledWith("LOAD_FAVORITE_GAMES_ERROR", error);
    });

    it("should add game to favorites successfully", async () => {
        // Создаем мок-объект с методом get, который возвращает разные значения
        const mockHttpClient = {
            get: vi.fn(async (url) => {
                return { data: [ MOCK_FAVORITE_GAME_ID ] };
            }),
            put: vi.fn().mockResolvedValue({}),
        } as Partial<AxiosInstance>;

        // Мокаем http чтобы он возвращал наш mockHttpClient
        vi.mocked(http).mockImplementation(() => mockHttpClient as AxiosInstance);

        const store = useGamesFavorite();
        await store.addGameToFavorites(MOCK_FAVORITE_GAME_ID);

        // Проверяем вызов PUT запроса
        expect(mockHttpClient.put).toHaveBeenCalledWith(`/api/player/favorite_games/${ MOCK_FAVORITE_GAME_ID }`);

        // Добавляем небольшую задержку, чтобы дать время на обновление store
        await new Promise((resolve) => setTimeout(resolve, 0));

        // Проверяем состояние store
        expect(store.favoritesId).toEqual([ MOCK_FAVORITE_GAME_ID ]);
    });

    it("should handle error when adding game to favorites", async () => {
        const error = new Error("API error");
        mockHttp.put.mockRejectedValue(error);

        const store = useGamesFavorite();

        await expect(store.addGameToFavorites(MOCK_FAVORITE_GAME_ID)).rejects.toThrow("API error");
        expect(log.error).toHaveBeenCalledWith("ADD_GAME_TO_FAVORITES_ERROR", error);
    });

    it("should delete game from favorites successfully", async () => {
        mockHttp.delete.mockResolvedValue({});

        const store = useGamesFavorite();

        type MinimalGameItem = {
            currencies: {
                [key: string]: {
                    id: number
                }
            }
        };

        // Set the initial state
        store.gamesFavoriteFullData = [
            {
                id: "game1",
                currencies: {
                    USD: { id: MOCK_FAVORITE_GAME_ID },
                    EUR: { id: 102 },
                    UAH: { id: 102 },
                },
            } as MinimalGameItem ] as unknown as IGameItem[];

        store.favoritesId = [ MOCK_FAVORITE_GAME_ID, 102, 103 ];

        await store.deleteGameFromFavorites(MOCK_FAVORITE_GAME_ID);

        expect(http).toHaveBeenCalled();
        expect(mockHttp.delete).toHaveBeenCalledWith(`/api/player/favorite_games/${ MOCK_FAVORITE_GAME_ID }`);

        // Verify the state was updated correctly
        expect(store.favoritesId).toEqual([ 102, 103 ]);
        expect(store.gamesFavoriteFullData).toEqual([]);
    });

    it("should handle error when deleting game from favorites", async () => {
        const error = new Error("API error");
        mockHttp.delete.mockRejectedValue(error);

        const store = useGamesFavorite();

        await expect(store.deleteGameFromFavorites(101)).rejects.toThrow("API error");
        expect(log.error).toHaveBeenCalledWith("DELETE_GAME_FROM_FAVORITES_ERROR", error);
    });

    it("should clear user data", () => {
        const store = useGamesFavorite();

        // Set initial state
        store.gamesFavoriteFullData = [ { id: "game1" } ] as IGameItem[];
        store.favoritesId = MOCK_GAMES_ID;

        store.clearUserData();

        expect(store.favoritesId).toEqual([]);
        expect(store.gamesFavoriteFullData).toEqual([]);
    });

    it("should return reversed favorites IDs", () => {
        const store = useGamesFavorite();

        store.favoritesId = MOCK_GAMES_ID;
        expect(store.gamesFavoriteID).toEqual(MOCK_GAMES_ID.reverse());
    });

    it("should return reversed full game data", () => {
        const store = useGamesFavorite();

        store.gamesFavoriteFullData = [
            { id: "game1" },
            { id: "game2" },
        ] as IGameItem[];

        expect(store.getGamesFavoriteFullData).toEqual([
            { id: "game2" },
            { id: "game1" },
        ]);
    });
});
