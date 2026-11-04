import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { loadProjectInfo } from "../../src/services/common";
import { useCommon } from "../../src/store/common";

const mocks = vi.hoisted(() => ({ request: vi.fn() }));

vi.mock("../../src/services/api/requests/info", () => ({ loadProjectInfoReq: mocks.request }));

beforeEach(() => {
    setActivePinia(createPinia());
    mocks.request.mockReset();
});

describe("loadProjectInfo", () => {
    it("loads project settings when the store is empty", async () => {
        const data = { gdpr_report_enabled: true };
        mocks.request.mockResolvedValue(data);

        await loadProjectInfo();

        expect(mocks.request).toHaveBeenCalledExactlyOnceWith();
        expect(useCommon().infoProject).toEqual(data);
        expect(useCommon().isGdprReportEnabled).toBe(true);
    });

    it.each([ undefined, { reload: false } ])("keeps cached settings with options %j", async (options) => {
        const store = useCommon();
        store.$patch({ infoProject: { player_two_factor_auth: true } });
        const cached = store.infoProject;

        await loadProjectInfo(options);

        expect(mocks.request).not.toHaveBeenCalled();
        expect(store.infoProject).toBe(cached);
    });

    it.each([ true, false ])("reloads anonymous settings and applies GDPR flag %s", async (enabled) => {
        const store = useCommon();
        store.$patch({ infoProject: { player_two_factor_auth: true } });
        const data = { player_two_factor_auth: true, gdpr_report_enabled: enabled };
        mocks.request.mockResolvedValue(data);

        await loadProjectInfo({ reload: true });

        expect(mocks.request).toHaveBeenCalledExactlyOnceWith();
        expect(store.infoProject).toEqual(data);
        expect(store.isGdprReportEnabled).toBe(enabled);
    });

    it("preserves cached settings when a forced request returns no data", async () => {
        const store = useCommon();
        store.$patch({ infoProject: { player_two_factor_auth: true } });
        const cached = store.infoProject;
        mocks.request.mockResolvedValue(undefined);

        await loadProjectInfo({ reload: true });

        expect(mocks.request).toHaveBeenCalledExactlyOnceWith();
        expect(store.infoProject).toBe(cached);
        expect(store.isGdprReportEnabled).toBe(false);
    });
});
