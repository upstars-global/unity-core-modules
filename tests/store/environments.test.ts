import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";

import { useEnvironments } from "../../src/store/environments";

describe("useEnvironments", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it("should initialize with default values", () => {
        const store = useEnvironments();

        expect(store.version).toBe("");
        expect(store.useMocker).toBe(false);
        expect(store.baseUrl).toBe("/");
        expect(store.environment).toBe("production");
        console.log("store.environment", store.environment);
        expect(store.isProduction).toBe(true);
    });

    it("should return correct values from getEnvironments", () => {
        const store = useEnvironments();

        // Set some custom values
        store.version = "1.0.0";
        store.useMocker = true;
        store.baseUrl = "/api/";
        store.environment = "development";

        // Check the computed property
        expect(store.getEnvironments).toEqual({
            version: "1.0.0",
            useMocker: true,
            baseUrl: "/api/",
            environment: "development",
            hostMetaPrefix: "",
        });
    });

    it("should correctly determine production environment", () => {
        const store = useEnvironments();

        // Default is production
        expect(store.isProduction).toBe(true);

        // Change to non-production
        store.environment = "development";
        expect(store.isProduction).toBe(false);

        // Change back to production
        store.environment = "production";
        expect(store.isProduction).toBe(true);
    });
});
