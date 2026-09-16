import { describe, expect, it, vi } from "vitest";

import { PlayaApiClient, PlayaApiError } from "../../../../src/services/api/clients/playa";

function response(data: unknown, status = 200, statusText = "OK") {
    return {
        json: vi.fn().mockResolvedValue(data),
        ok: status >= 200 && status < 300,
        status,
        statusText,
    } as unknown as Response;
}

describe("PlayaApiClient", () => {
    it("requests player recommendations with the API and player headers", async() => {
        const fetcher = vi.fn().mockResolvedValue(response({ data: { categories: [] } }));
        const client = new PlayaApiClient({
            apiKey: "test-key",
            baseUrl: "https://playa.example/",
            fetcher,
        });

        await expect(client.getPlayerRecommendations("player-1")).resolves.toEqual({ categories: [] });
        expect(fetcher).toHaveBeenCalledWith("https://playa.example/v1/recommendations/player", {
            headers: {
                "X-API-Key": "test-key",
                "X-Player-ID": "player-1",
            },
        });
    });

    it("requests guest category games with pagination", async() => {
        const categoryGames = {
            data: { id: "top", name: "Top", games: [] },
            pagination: { page: 2, limit: 20, total: 40 },
        };
        const fetcher = vi.fn().mockResolvedValue(response(categoryGames));
        const client = new PlayaApiClient({
            apiKey: "test-key",
            baseUrl: "https://playa.example",
            fetcher,
        });

        await expect(client.getGuestCategoryGames("top slots", 2, "CA", 100)).resolves.toEqual(categoryGames);

        expect(fetcher).toHaveBeenCalledWith("https://playa.example/v1/recommendations/guest/categories/top%20slots/games?page=2&limit=100&country=CA", {
            headers: {
                "X-API-Key": "test-key",
            },
        });
    });

    it("requests guest recommendations for the visitor country", async() => {
        const fetcher = vi.fn().mockResolvedValue(response({ data: { categories: [] } }));
        const client = new PlayaApiClient({ apiKey: "test-key", baseUrl: "https://playa.example", fetcher });

        await expect(client.getGuestRecommendations("CA")).resolves.toEqual({ categories: [] });
        expect(fetcher).toHaveBeenCalledWith("https://playa.example/v1/recommendations/guest?country=CA", {
            headers: { "X-API-Key": "test-key" },
        });
    });

    it("surfaces Playa response status", async() => {
        const client = new PlayaApiClient({
            apiKey: "test-key",
            baseUrl: "https://playa.example",
            fetcher: vi.fn().mockResolvedValue(response({}, 401, "Unauthorized")),
        });

        await expect(client.getGuestRecommendations()).rejects.toMatchObject(new PlayaApiError(401, "Unauthorized"));
    });

    it("surfaces Playa response status when its body is empty", async() => {
        const client = new PlayaApiClient({
            apiKey: "test-key",
            baseUrl: "https://playa.example",
            fetcher: vi.fn().mockResolvedValue({
                json: vi.fn().mockRejectedValue(new Error("Unexpected end of JSON input")),
                ok: false,
                status: 404,
                statusText: "Not Found",
            } as unknown as Response),
        });

        await expect(client.getGuestRecommendations()).rejects.toMatchObject(new PlayaApiError(404, "Not Found"));
    });
});
