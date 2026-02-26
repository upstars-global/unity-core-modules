import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useSettings } from "../../src/store/settings";

describe("useSettings", () => {
    beforeEach(async () => {
        setActivePinia(createPinia());
    });

    it("should create settings store with default values", () => {
        const store = useSettings();

        expect(store.apiUrl).toBe("/");
        expect(store.websocketUrl).toBe("/sock");
        expect(store.valdemoroSrc).toBe("");
        expect(store.isCryptoDomain).toBe(false);
        expect(store.sentryDsn).toBe("");
    });

    it("should update apiUrl", () => {
        const url = "https://example.com/api";
        const store = useSettings();
        store.apiUrl = url;
        expect(store.apiUrl).toBe(url);
    });

    it("should update websocketUrl", () => {
        const url = "wss://example.com/ws";
        const store = useSettings();
        store.websocketUrl = url;
        expect(store.websocketUrl).toBe(url);
    });

    it("should update valdemoroSrc", () => {
        const url = "https://cdn.example.com/image.png";
        const store = useSettings();
        store.valdemoroSrc = url;
        expect(store.valdemoroSrc).toBe(url);
    });

    it("should update isCryptoDomain", () => {
        const store = useSettings();
        store.isCryptoDomain = true;
        expect(store.isCryptoDomain).toBe(true);
    });

    it("should update sentryDsn", () => {
        const url = "https://sentry.example.com";
        const store = useSettings();
        store.sentryDsn = url;
        expect(store.sentryDsn).toBe(url);
    });
});
