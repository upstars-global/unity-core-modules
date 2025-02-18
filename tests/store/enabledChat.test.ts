import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CHAT_LIVECHAT, DEFAULT_CHAT, useEnabledChatStore } from "../../src/store/enabledChat";
import { useLevelsStore } from "../../src/store/levels/levelsStore";

vi.mock("@theme/configs/constantsFreshChat", () => ({ CHAT_ID: 1 }));
vi.mock("../../src/store/levels/levelsStore", () => ({
    useLevelsStore: vi.fn(() => ({
        groups: [],
    })),
}));

describe("store/enabledChat", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });


    it("should initialize with default values", () => {
        expect(useEnabledChatStore().enabledChat).toBeNull();
    });

    it(`should return default '${DEFAULT_CHAT}' if levels store doesn't have specific group`, () => {
        useLevelsStore.mockReturnValue({
            groups: [ { id: 2, writable: false } ],
        });

        expect(useEnabledChatStore().enabledChat).toBe(DEFAULT_CHAT);
    });

    it(`should return default '${DEFAULT_CHAT}' if levels store has specific group but it is not writable`, () => {
        useLevelsStore.mockReturnValue({
            groups: [ { id: 1, writable: false } ],
        });

        expect(useEnabledChatStore().enabledChat).toBe(DEFAULT_CHAT);
    });

    it(`should return '${CHAT_LIVECHAT}' if levels store has specific group and it is writable`, () => {
        useLevelsStore.mockReturnValue({
            groups: [ { id: 1, writable: true } ],
        });

        expect(useEnabledChatStore().enabledChat).toBe(CHAT_LIVECHAT);
    });
});
