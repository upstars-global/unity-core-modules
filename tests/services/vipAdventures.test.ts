import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { loadVipAdventuresConfigFile } from "../../src/services/api/requests/vipAdventures";
import { useVipAdventuresService } from "../../src/services/vipAdventures";
import { useVipAdventures } from "../../src/store/user/vipAdventures";

const mockUserStatuses = {
    getUserStatuses: [],
    getUserGroups: [],
};

vi.mock("../../src/store/user/userStatuses", () => ({
    useUserStatuses: () => mockUserStatuses,
}));

vi.mock("../../src/store/environments", () => ({
    useEnvironments: () => ({
        useMocker: false,
    }),
}));

vi.mock("../../src/services/api/requests/vipAdventures", () => ({
    loadVipAdventuresConfigFile: vi.fn(),
    loadVipStatusProgress: vi.fn(),
}));

vi.mock("../../src/controllers/Logger", () => ({
    log: {
        error: vi.fn(),
    },
}));

describe("useVipAdventuresService", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        mockUserStatuses.getUserGroups = [];
        vi.mocked(loadVipAdventuresConfigFile).mockReset();
    });

    it("reuses one in-flight adventure config request", async() => {
        vi.mocked(loadVipAdventuresConfigFile).mockResolvedValue({
            prizes: {},
            variables: {},
        });

        const service = useVipAdventuresService();

        await Promise.all([
            service.loadVipAdventuresConfig(),
            service.loadVipAdventuresConfig(),
            service.loadVipAdventuresConfig(),
        ]);

        expect(loadVipAdventuresConfigFile).toHaveBeenCalledTimes(1);
        expect(useVipAdventures().isConfigLoaded).toBe(true);
    });
});
