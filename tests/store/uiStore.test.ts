import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

import bodyDisableScroll from "../../src/helpers/bodyDisableScroll";
import { IModalOptions } from "../../src/models/modalOptions";
import { EventBus as bus } from "../../src/plugins/EventBus";
import { useUIStore } from "../../src/store/ui";

vi.mock("../../src/helpers/bodyDisableScroll", () => ({
    default: vi.fn(),
}));

vi.mock("../../src/plugins/EventBus", () => ({
    EventBus: {
        $emit: vi.fn(),
    },
}));

describe("useUIStore", () => {
    const modalConfig: IModalOptions = { name: "testModal", component: "test" };
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    it("should initialize with default values", () => {
        const store = useUIStore();

        expect(store.showModal).toBe(false);
        expect(store.modals).toEqual([]);
        expect(store.isThemeDark).toBeDefined();
        expect(store.colorTheme).toBeDefined();
    });

    it("should open a modal and call bodyDisableScroll", () => {
        const store = useUIStore();

        store.setShowModal(modalConfig);

        expect(store.showModal).toBe(true);
        expect(store.modals).toContainEqual(modalConfig);
        expect(bodyDisableScroll).toHaveBeenCalledWith(true);
    });

    it("should not open the same modal twice", () => {
        const store = useUIStore();

        store.setShowModal(modalConfig);
        store.setShowModal(modalConfig);

        expect(store.modals.length).toBe(1);
    });

    it("should close a modal and call bodyDisableScroll when no modals left", () => {
        vi.useFakeTimers();
        const store = useUIStore();

        store.setShowModal(modalConfig);
        store.closeModal({ name: "testModal" });

        expect(store.modals.length).toBe(0);
        expect(store.showModal).toBe(true);

        vi.advanceTimersByTime(100);

        expect(store.showModal).toBe(false);
        expect(bodyDisableScroll).toHaveBeenCalledWith(false);
        expect(bus.$emit).toHaveBeenCalledWith("modal.closed", "testModal", {});
    });

    it("should close a modal immediately when `immediate` flag is true", () => {
        const store = useUIStore();

        store.setShowModal(modalConfig);
        store.closeModal({ name: "testModal", immediate: true });

        expect(store.showModal).toBe(false);
    });

    it("should update theme correctly", () => {
        const store = useUIStore();
        store.colorTheme = "theme-light";

        expect(store.colorTheme).toBe("theme-light");
        expect(store.isThemeDark).toBe(false);
    });
});
