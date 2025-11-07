import { defineStore } from "pinia";
import { computed, ref } from "vue";

import type { IAuthProvider, IUserAuthProvider } from "../models/authProviders";

const AUTH_PROVIDERS_MAP: Record<string, string> = {
    google_oauth2: "google",
};

export const useAuthProvidersStore = defineStore("authProviders", () => {
    const authProviders = ref<IAuthProvider[]>([]);
    const userAuthProviders = ref<IUserAuthProvider[]>([]);
    const userAuthProvidersLoaded = ref<boolean>(false);

    function setAuthProviders(providers: IAuthProvider[]) {
        authProviders.value = providers;
    };

    function setUserAuthProviders(providers: IUserAuthProvider[]) {
        userAuthProviders.value = providers;
    };

    function setUserAuthProvidersLoadedStatus(status: boolean) {
        userAuthProvidersLoaded.value = status;
    };

    const clearState = () => {
        userAuthProviders.value = [];
    };

    const getProviderList = computed(() => {
        return authProviders.value.map((provider) => {
            const connectedProvider = userAuthProviders.value
                .find((userAuthProvider) => userAuthProvider.type === AUTH_PROVIDERS_MAP[provider.name]);

            return {
                ...provider,
                ...(connectedProvider || {}),
                connected: Boolean(connectedProvider),
            };
        });
    });

    return {
        authProviders,
        userAuthProvidersLoaded,
        setUserAuthProvidersLoadedStatus,
        userAuthProviders,
        setAuthProviders,
        setUserAuthProviders,
        getProviderList,
        clearState,
    };
});
