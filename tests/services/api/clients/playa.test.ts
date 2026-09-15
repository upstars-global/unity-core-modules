import { describe, expect, it, vi } from "vitest";

import { PlayaApiClient, PlayaApiError } from "../../../../src/services/api/clients/playa";

function response(data: unknown, status = 200, statusText = "OK") {
    return {
        json: vi.fn().mockResolvedValue({ data }),
        ok: status >= 200 && status < 300,
        status,
        statusText,
    } as unknown as Response;
}

describe("PlayaApiClient", () => {
    it("requests player recommendations with the API and player headers", async() => {
        const fetcher = vi.fn().mockResolvedValue(response({ categories: [] }));
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
        const fetcher = vi.fn().mockResolvedValue(response({ data: [], pagination: {} }));
        const client = new PlayaApiClient({
            apiKey: "test-key",
            baseUrl: "https://playa.example",
            fetcher,
        });

        await client.getGuestCategoryGames("top slots", 2);

        expect(fetcher).toHaveBeenCalledWith("https://playa.example/v1/recommendations/guest/categories/top%20slots/games?page=2", {
            headers: {
                "X-API-Key": "test-key",
            },
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
