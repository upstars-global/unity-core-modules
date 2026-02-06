import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

const setupMatchMedia = (matches: boolean) => {
    if (!("window" in globalThis)) {
        (globalThis as typeof globalThis & { window?: unknown }).window = {} as unknown;
    }
    Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: vi.fn().mockReturnValue({ matches }),
    });
};

const loadStore = async (isServer: boolean) => {
    vi.resetModules();
    vi.doMock("../../src/helpers/ssrHelpers", () => ({
        isServer,
    }));

    const mod = await import("../../src/store/pwa");
    return mod.usePWA;
};

describe("usePWA store", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it("updates prompts and flags", async () => {
        const usePWA = await loadStore(false);
        const store = usePWA();

        store.setDeferredPWAPrompt({} as BeforeInstallPromptEvent);
        store.setShowPwaInfo(false);

        expect(store.deferredPWAPrompt).toBeTruthy();
        expect(store.showPwaInfo).toBe(false);
    });

    it("sets isPWA from matchMedia when value is not provided", async () => {
        setupMatchMedia(true);
        const usePWA = await loadStore(false);
        const store = usePWA();

        store.setIsPWA();

        expect(store.isPWA).toBe(true);
    });

    it("does not change isPWA on server", async () => {
        setupMatchMedia(false);
        const usePWA = await loadStore(true);
        const store = usePWA();

        store.isPWA = true;
        store.setIsPWA(false);

        expect(store.isPWA).toBe(true);
    });
});
