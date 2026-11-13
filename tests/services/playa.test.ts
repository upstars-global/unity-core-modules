import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    filterGames: vi.fn((games: unknown[]) => games),
    loadPlayaCategoryGamesReq: vi.fn(),
    loadPlayaRecommendationsReq: vi.fn(),
    processGameForNewAPI: vi.fn((game: { identifier: string }) => ({ id: game.identifier })),
}));

vi.mock("../../src/helpers/gameHelpers", () => ({
    filterGames: mocks.filterGames,
    processGameForNewAPI: mocks.processGameForNewAPI,
}));

vi.mock("../../src/services/api/requests/playa", () => ({
    loadPlayaCategoryGamesReq: mocks.loadPlayaCategoryGamesReq,
    loadPlayaRecommendationsReq: mocks.loadPlayaRecommendationsReq,
}));

import { loadPlayaCategory, loadPlayaRecommendations } from "../../src/services/playa";
import { useGamesProviders } from "../../src/store/games/gamesProviders";
import { useGamesCommon } from "../../src/store/games/gamesStore";

describe("Playa games", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.filterGames.mockImplementation((games: unknown[]) => games);
        useGamesProviders().setDisabledGamesProviders({ provider: [ "CA" ] });
        useGamesCommon().setEnableGamesConfig({ game: [ "CA" ] });
    });

    it("processes categories and removes empty filtered rows", async() => {
        mocks.loadPlayaRecommendationsReq.mockResolvedValue({
            categories: [
                { id: "top", name: "Top", games: [ { identifier: "game-1" } ] },
                { id: "new", name: "New", games: [ { identifier: "game-2" } ] },
            ],
        });
        mocks.filterGames
            .mockImplementationOnce(() => [])
            .mockImplementationOnce((games: unknown[]) => games);

        await expect(loadPlayaRecommendations()).resolves.toEqual({
            categories: [
                { id: "new", name: "New", games: [ { id: "game-2" } ] },
            ],
        });
        expect(mocks.filterGames).toHaveBeenCalledTimes(2);
        expect(mocks.filterGames).toHaveBeenCalledWith(
            [ { id: "game-1" } ],
            { provider: [ "CA" ] },
            { game: [ "CA" ] },
        );
    });

    it("returns a processed category without pagination", async() => {
        mocks.loadPlayaCategoryGamesReq.mockResolvedValue({
            data: { id: "top", name: "Top", games: [ { identifier: "game-1" } ] },
        });

        await expect(loadPlayaCategory("top")).resolves.toEqual({
            id: "top",
            name: "Top",
            games: [ { id: "game-1" } ],
        });
        expect(mocks.loadPlayaCategoryGamesReq).toHaveBeenCalledWith("top");
    });

    it("preserves an unavailable response", async() => {
        mocks.loadPlayaRecommendationsReq.mockResolvedValue(undefined);
        mocks.loadPlayaCategoryGamesReq.mockResolvedValue(undefined);

        await expect(loadPlayaRecommendations()).resolves.toBeUndefined();
        await expect(loadPlayaCategory("top")).resolves.toBeUndefined();
        expect(mocks.filterGames).not.toHaveBeenCalled();
    });
});
