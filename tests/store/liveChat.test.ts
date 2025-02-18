import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useLivechatStore } from "../../src/store/liveChat";

vi.stubGlobal("localStorage", {
    getItem: vi.fn(),
    setItem: vi.fn(),
});
vi.stubGlobal("Date", {
    now: vi.fn(),
});

describe("store/liveChat", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it("should initialize with default values", () => {
        const store = useLivechatStore();

        expect(store.getNewMessagesCount).toBe(0);
        expect(store.getOpenChat).toBe(false);
    });

    it("should set the openChat state correctly", () => {
        const store = useLivechatStore();

        store.setOpenChat();
        expect(store.getOpenChat).toBe(true);
    });

    it("should increase messages count after setting it", () => {
        const store = useLivechatStore();

        store.setMessage({ message:"message", timestamp: 1 });
        expect(store.getNewMessagesCount).toBe(1);
    });

    it("should not increase messages count if lastOpen timestamp is less than message timestamp", () => {
        const store = useLivechatStore();

        localStorage.getItem.mockReturnValue(1);

        store.setMessage({ message:"message", timestamp: 1 });
        store.setMessage({ message:"message", timestamp: 2 });

        expect(store.getNewMessagesCount).toBe(1);
    });

    it("should reset messages count", () => {
        const store = useLivechatStore();

        store.setMessage({ message:"message", timestamp: 1 });
        store.resetMessageCount();

        expect(store.getNewMessagesCount).toBe(0);
    });

    it("should set timestamp for lastOpen", () => {
        const store = useLivechatStore();

        Date.now.mockReturnValueOnce(1);

        store.setChatOpen();

        expect(localStorage.setItem).toHaveBeenCalledWith("lastOpen", "1");
        expect(store.getNewMessagesCount).toBe(0);
    });

    it("should reset the openChat state correctly", () => {
        const store = useLivechatStore();

        store.resetOpenChat();

        expect(store.getOpenChat).toBe(false);
    });
});
