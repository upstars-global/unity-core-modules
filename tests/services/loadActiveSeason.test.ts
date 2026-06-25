import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { IActiveSeason } from "../../src/models/user";
import { useConfigStore } from "../../src/store/configStore";

const seasonsActiveReqMock = vi.fn();

vi.mock("../../src/controllers/Logger", () => ({
    log: { error: vi.fn() },
}));

vi.mock("../../src/services/api/requests/player", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../../src/services/api/requests/player")>();

    return {
        ...actual,
        seasonsActiveReq: (...args: unknown[]) => seasonsActiveReqMock(...args),
    };
});

function minimalActiveSeason(): IActiveSeason {
    return {
        name: "Season 1",
        isActive: true,
        startDate: "2026-06-08T11:43:19.450Z",
        endDate: "2026-07-08T11:43:19.450Z",
        technicalWorksStartAt: "2026-06-08T11:43:19.450Z",
    };
}

describe("loadActiveSeason", () => {
    beforeEach(async () => {
        vi.resetModules();
        setActivePinia(createPinia());
        seasonsActiveReqMock.mockReset();
        seasonsActiveReqMock.mockResolvedValue(minimalActiveSeason());

        const { log } = await import("../../src/controllers/Logger");
        vi.mocked(log.error).mockClear();
    });

    it("stores the active season returned by the API", async () => {
        const data = minimalActiveSeason();
        seasonsActiveReqMock.mockResolvedValue(data);
        const { loadActiveSeason } = await import("../../src/services/user");
        const store = useConfigStore();

        await loadActiveSeason();

        expect(seasonsActiveReqMock).toHaveBeenCalledTimes(1);
        expect(store.activeSeason).toEqual(data);
        expect(store.isLoadingActiveSeason).toBe(false);
    });

    it("keeps the store empty when the API returns no season", async () => {
        seasonsActiveReqMock.mockResolvedValue(undefined);
        const { loadActiveSeason } = await import("../../src/services/user");
        const store = useConfigStore();

        await loadActiveSeason();

        expect(seasonsActiveReqMock).toHaveBeenCalledTimes(1);
        expect(store.activeSeason).toBeNull();
        expect(store.isLoadingActiveSeason).toBe(false);
    });

    it("keeps the store empty and logs when the API throws", async () => {
        seasonsActiveReqMock.mockRejectedValue(new Error("network"));
        const { loadActiveSeason } = await import("../../src/services/user");
        const { log } = await import("../../src/controllers/Logger");
        const store = useConfigStore();

        await loadActiveSeason();

        expect(store.activeSeason).toBeNull();
        expect(log.error).toHaveBeenCalledWith(
            "PORTOFRANCO_SEASONS_ACTIVE_ERROR",
            expect.any(Error),
        );
        expect(store.isLoadingActiveSeason).toBe(false);
    });

    it("toggles loading state while the request is in flight", async () => {
        seasonsActiveReqMock.mockImplementation(async () => {
            expect(store.isLoadingActiveSeason).toBe(true);
            return minimalActiveSeason();
        });
        const { loadActiveSeason } = await import("../../src/services/user");
        const store = useConfigStore();

        await loadActiveSeason();

        expect(store.isLoadingActiveSeason).toBe(false);
    });
});
