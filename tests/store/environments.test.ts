import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";

import { useEnvironments, useEnvironmentsFetchService } from "../../src/store/environments";

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

describe("useEnvironmentsFetchService", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it("should return a loadEnvironments function", () => {
        const service = useEnvironmentsFetchService();

        expect(service).toHaveProperty("loadEnvironments");
        expect(typeof service.loadEnvironments).toBe("function");
    });

    it("loadEnvironments should return a resolved promise", async () => {
        const service = useEnvironmentsFetchService();

        const result = await service.loadEnvironments();

        expect(result).toBeUndefined();
    });

    it("should initialize the environments store", () => {
        const pinia = createPinia();
        setActivePinia(pinia);

        // Create the service which should initialize the store
        useEnvironmentsFetchService(pinia);

        // Verify the store was initialized
        const store = useEnvironments();
        expect(store).toBeDefined();
    });
});
