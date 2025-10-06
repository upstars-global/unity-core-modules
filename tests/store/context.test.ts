import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useContextStore } from "../../src/store/context";

const mockGetClientContext = vi.fn();

vi.mock("../../src/services/api/requests/context", () => ({
    getClientContext: () => mockGetClientContext(),
}));

describe("useContextStore", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        mockGetClientContext.mockReset();
    });

    it("should have initial state", () => {
        const store = useContextStore();
        expect(store.context).toBeUndefined();
        expect(store.pending).toBe(false);
        expect(store.isBotUA).toBeUndefined();
    });

    it("should fetch and set context via getContext", async () => {
        const mockContext = { isBot: true };
        mockGetClientContext.mockResolvedValueOnce(mockContext);

        const store = useContextStore();
        const promise = store.getContext();

        expect(store.pending).toBe(true);

        const result = await promise;

        expect(store.context).toEqual(mockContext);
        expect(result).toEqual(mockContext);
        expect(store.pending).toBe(false);
        expect(store.isBotUA).toBe(true);
    });

    it("should not fetch context again if already set", async () => {
        const mockContext = { isBot: false };
        const getClientContextSpy = mockGetClientContext.mockResolvedValueOnce(mockContext);
        const store = useContextStore();
        await store.getContext();
        await store.getContext();

        expect(getClientContextSpy).toHaveBeenCalledTimes(1);
        expect(store.context).toEqual(mockContext);
    });
});
