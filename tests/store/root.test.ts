import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getBrowserName, isAndroidUserAgent, isIOSUserAgent } from "../../src/helpers/platformHelpers";
import { useRootStore } from "../../src/store/root";

vi.mock("../../src/helpers/platformHelpers", () => ({
    isIOSUserAgent: vi.fn(),
    isAndroidUserAgent: vi.fn(),
    getBrowserName: vi.fn(),
}));

describe("store/root", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.resetAllMocks();
    });

    it("should initialize with default values", () => {
        const store = useRootStore();

        expect(store.gamePage).toBe(false);
        expect(store.guest).toBe(false);
        expect(store.isGamePage).toBe(false);
        expect(store.isGuest).toBe(false);
        expect(store.isMobile).toBeNull();
        expect(store.transitionName).toBeNull();
        expect(store.getPlatform).toBeNull();
    });

    it("should set the gamePage state correctly", () => {
        const store = useRootStore();

        store.setGamePage(true);
        expect(store.isGamePage).toBe(true);
    });

    it("should set the platform state correctly", () => {
        const store = useRootStore();
        const platform = {
            isMobile: true,
            transitionName: "transitionName",
        };

        store.setPlatform(platform);

        expect(store.isMobile).toBe(true);
        expect(store.transitionName).toBe("transitionName");
        expect(store.getPlatform).toEqual(platform);
    });

    it("should compute isMobile correctly", () => {
        const store = useRootStore();

        store.setPlatform({ isMobile: true, transitionName: "transitionName" });
        expect(store.isMobile).toBe(true);

        store.setPlatform({ isMobile: false, transitionName: "transitionName" });
        expect(store.isMobile).toBe(false);
    });

    it("should compute isGuest correctly", () => {
        const store = useRootStore();

        expect(store.isGuest).toBe(false);

        store.guest = true;

        expect(store.isGuest).toBe(true);
    });

    it("should detect iOS platform correctly", () => {
        isIOSUserAgent.mockReturnValue(true);

        const store = useRootStore();
        store.platform = { userAgentHints: {} };

        expect(store.isIOSPlatform).toBe(true);
        expect(isIOSUserAgent).toHaveBeenCalledWith({});
    });

    it("should detect Android platform correctly", () => {
        isAndroidUserAgent.mockReturnValue(true);

        const store = useRootStore();
        store.platform = { userAgentHints: {} };

        expect(store.isAndroidPlatform).toBe(true);
        expect(isAndroidUserAgent).toHaveBeenCalledWith({});
    });

    it("should return correct browser name", () => {
        getBrowserName.mockReturnValue("Chrome");

        const store = useRootStore();
        store.platform = { userAgentHints: {} };

        expect(store.getBrowser).toBe("Chrome");
        expect(getBrowserName).toHaveBeenCalledWith({});
    });

    it("should return undefined when platform is not set", () => {
        isIOSUserAgent.mockReturnValue(false);
        isAndroidUserAgent.mockReturnValue(false);
        getBrowserName.mockReturnValue(undefined);

        const store = useRootStore();
        store.platform = null;

        expect(store.isIOSPlatform).toBe(false);
        expect(store.isAndroidPlatform).toBe(false);
        expect(store.getBrowser).toBeUndefined();
    });
});
