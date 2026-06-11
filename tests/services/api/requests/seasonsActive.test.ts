import { afterEach, describe, expect, it, vi } from "vitest";

const setupPlayerRequestsModule = async () => {
    vi.resetModules();

    const getMock = vi.fn();
    const logError = vi.fn();

    vi.doMock("../../../../src/controllers/Logger", () => ({
        log: {
            error: logError,
        },
    }));
    vi.doMock("../../../../src/services/api/http", () => ({
        http: vi.fn(() => ({
            get: getMock,
        })),
    }));

    const playerRequestsModule = await import("../../../../src/services/api/requests/player");

    return {
        ...playerRequestsModule,
        getMock,
        logError,
    };
};

afterEach(() => {
    vi.restoreAllMocks();
});

describe("seasonsActiveReq", () => {
    it("requests the active season and returns data.season", async () => {
        const { getMock, seasonsActiveReq } = await setupPlayerRequestsModule();
        const season = {
            name: "Season 1",
            isActive: true,
            startDate: "2026-06-08T11:43:19.450Z",
            endDate: "2026-07-08T11:43:19.450Z",
            technicalWorksStartAt: "2026-06-08T11:43:19.450Z",
        };
        getMock.mockResolvedValue({ data: { season } });

        await expect(seasonsActiveReq()).resolves.toEqual(season);
        expect(getMock).toHaveBeenCalledWith("/api-fe/pf/seasons/active");
    });

    it("returns undefined and logs when the request fails", async () => {
        const { getMock, logError, seasonsActiveReq } = await setupPlayerRequestsModule();
        const error = new Error("network");
        getMock.mockRejectedValue(error);

        await expect(seasonsActiveReq()).resolves.toBeUndefined();
        expect(logError).toHaveBeenCalledWith("PORTOFRANCO_SEASONS_ACTIVE_REQ_ERROR", error);
    });
});
