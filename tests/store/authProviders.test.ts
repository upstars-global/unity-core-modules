import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";

import { useAuthProvidersStore } from "../../src/store/authProviders";

describe("useAuthProvidersStore", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it("should initialize with default values", () => {
        const store = useAuthProvidersStore();

        expect(store.authProviders).toEqual([]);
        expect(store.userAuthProviders).toEqual([]);
        expect(store.userAuthProvidersLoaded).toBe(false);
        expect(store.getProviderList).toEqual([]);
    });

    it("should map providers with connected status", () => {
        const store = useAuthProvidersStore();

        store.setAuthProviders([
            { name: "google_oauth2", url: "/oauth/google" },
        ]);

        store.setUserAuthProviders([
            {
                id: 1,
                type: "google",
                active: true,
                uid: "123",
                social_network_account: "user@example.com",
                confirmed_at: "2024-01-01T00:00:00Z",
                removable: true,
            },
        ]);

        expect(store.getProviderList).toHaveLength(1);
        expect(store.getProviderList[0]).toMatchObject({
            name: "google_oauth2",
            url: "/oauth/google",
            type: "google",
            active: true,
            uid: "123",
            social_network_account: "user@example.com",
            connected: true,
        });
    });

    it("marks provider as disconnected when no user auth provider", () => {
        const store = useAuthProvidersStore();

        store.setAuthProviders([
            { name: "google_oauth2", url: "/oauth/google" },
        ]);

        expect(store.getProviderList).toEqual([
            {
                name: "google_oauth2",
                url: "/oauth/google",
                connected: false,
            },
        ]);
    });

    it("should clear user auth providers", () => {
        const store = useAuthProvidersStore();

        store.setAuthProviders([ { name: "google_oauth2", url: "/oauth/google" } ]);
        store.setUserAuthProviders([ {
            id: 1,
            type: "google",
            active: true,
            uid: "123",
            social_network_account: "user@example.com",
            confirmed_at: "2024-01-01T00:00:00Z",
            removable: true,
        } ]);

        store.clearState();

        expect(store.userAuthProviders).toEqual([]);
        expect(store.authProviders).toHaveLength(1);
    });

    it("updates loaded status", () => {
        const store = useAuthProvidersStore();

        store.setUserAuthProvidersLoadedStatus(true);

        expect(store.userAuthProvidersLoaded).toBe(true);
    });
});
