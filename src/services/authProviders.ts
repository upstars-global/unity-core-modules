import { isExistData } from "../helpers/isExistData";
import { useAuthProvidersStore } from "../store/authProviders";
import { disconnectAuthProviderReq, getAuthProvidersReq, getUserAuthProvidersReq } from "./api/requests/player";

export async function loadAuthProviders() {
    const authProvidersStore = useAuthProvidersStore();

    if (isExistData(authProvidersStore.authProviders)) {
        return;
    }

    const data = await getAuthProvidersReq();

    if (data) {
        authProvidersStore.setAuthProviders(data);
    }
}

export async function loadUserAuthProviders() {
    const authProvidersStore = useAuthProvidersStore();

    if (isExistData(authProvidersStore.userAuthProviders)) {
        return;
    }

    const data = await getUserAuthProvidersReq();

    authProvidersStore.setUserAuthProvidersLoadedStatus(true);

    if (data) {
        authProvidersStore.setUserAuthProviders(data);
    }
}

export async function disconnectAuthProvider(id: number) {
    const { clearState } = useAuthProvidersStore();

    const data = await disconnectAuthProviderReq(id);

    if (data?.status === 200) {
        clearState();
    }
}
