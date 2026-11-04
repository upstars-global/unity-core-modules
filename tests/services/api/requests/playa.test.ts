import { afterEach, describe, expect, it, vi } from "vitest";

async function setup() {
    vi.resetModules();

    const get = vi.fn();
    const error = vi.fn();

    vi.doMock("../../../../src/controllers/Logger", () => ({ log: { error } }));
    vi.doMock("../../../../src/services/api/http", () => ({ http: () => ({ get }) }));

    return {
        ...(await import("../../../../src/services/api/requests/playa")),
        error,
        get,
    };
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe("Playa proxy requests", () => {
    it("loads lobby recommendations through the Alpa proxy", async() => {
        const { get, loadPlayaRecommendationsReq } = await setup();
        get.mockResolvedValue({ data: { categories: [] } });

        await expect(loadPlayaRecommendationsReq()).resolves.toEqual({ categories: [] });
        expect(get).toHaveBeenCalledWith("/api-fe/playa/recommendations");
    });

    it("loads a category through the Alpa proxy", async() => {
        const { get, loadPlayaCategoryGamesReq } = await setup();
        const response = { data: { id: "top slots", name: "Top slots", games: [] } };
        get.mockResolvedValue({ data: response });

        await expect(loadPlayaCategoryGamesReq("top slots")).resolves.toEqual(response);
        expect(get).toHaveBeenCalledWith("/api-fe/playa/recommendations/categories/top%20slots/games");
    });

    it("logs proxy errors without breaking the lobby page", async() => {
        const { error, get, loadPlayaRecommendationsReq } = await setup();
        const requestError = new Error("unavailable");
        get.mockRejectedValue(requestError);

        await expect(loadPlayaRecommendationsReq()).resolves.toBeUndefined();
        expect(error).toHaveBeenCalledWith("LOAD_PLAYA_RECOMMENDATIONS_ERROR", requestError);
    });

    it("logs category errors without breaking the category page", async() => {
        const { error, get, loadPlayaCategoryGamesReq } = await setup();
        const requestError = new Error("unavailable");
        get.mockRejectedValue(requestError);

        await expect(loadPlayaCategoryGamesReq("top")).resolves.toBeUndefined();
        expect(error).toHaveBeenCalledWith("LOAD_PLAYA_CATEGORY_GAMES_ERROR", requestError);
    });
});
