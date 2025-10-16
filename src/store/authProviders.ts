import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { IAuthProvider, IUserAuthProvider } from "../models/authProviders";

const AUTH_PROVIDERS_MAP: Record<string, string> = {
    google_oauth2: "google",
};

export const useAuthProvidersStore = defineStore("authProviders", () => {
    const authProviders = ref<IAuthProvider[]>([]);
    const userAuthProviders = ref<IUserAuthProvider[]>([]);

    const setAuthProviders = (providers: IAuthProvider[]) => {
        authProviders.value = providers;
    };

    const setUserAuthProviders = (providers: IUserAuthProvider[]) => {
        userAuthProviders.value = providers;
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
        userAuthProviders,
        setAuthProviders,
        setUserAuthProviders,
        getProviderList,
        clearState,
    };
});
