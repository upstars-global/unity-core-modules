import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";

import { useRootStore } from "../../src/store/root";

describe("store/root", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
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
});
