import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

import { loadPagesConfig } from "../../src/services/managePages";
import { useManagePages } from "../../src/store/useManagePages";
import { useUserStatuses } from "../../src/store/user/userStatuses";

const userStatusesMock = { isUserTester: ref(false) };

vi.mock("../../src/services/api/requests/managePages", () => ({
    loadManagePagesConfigReq: vi.fn(async () => ({ page1: true, page2: false })),
}));
vi.mock("../../src/store/user/userStatuses", () => ({
    useUserStatuses: vi.fn(() => userStatusesMock),
}));

describe("useManagePages", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        userStatusesMock.isUserTester.value = false;
    });

    it("initializes with undefined pageConfiguration", () => {
        const store = useManagePages();
        expect(store.pageConfiguration).toBeUndefined();
    });

    it("loads pages config and sets pageConfiguration", async () => {
        const store = useManagePages();
        await loadPagesConfig();
        expect(store.pageConfiguration).toEqual({ page1: true, page2: false });
    });

    it("does not reload config if already loaded", async () => {
        const store = useManagePages();
        await loadPagesConfig();
        const prevConfig = store.pageConfiguration;
        await loadPagesConfig();
        expect(store.pageConfiguration).toBe(prevConfig);
    });

    it("isEnablePageBySlug returns correct value from config", async () => {
        const store = useManagePages();
        await loadPagesConfig();
        expect(store.isEnablePageBySlug("page1")).toBe(true);
        expect(store.isEnablePageBySlug("page2")).toBe(false);
        expect(store.isEnablePageBySlug("unknown")).toBe(false);
    });

    it("isEnablePageBySlug returns isUserTester if true", async () => {
        vi.mocked(useUserStatuses)
            .mockReturnValueOnce({ isUserTester: ref(true) });


        const store = useManagePages();
        await loadPagesConfig();
        expect(store.isEnablePageBySlug("any")).toBe(true);
    });
});
