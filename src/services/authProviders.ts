import { useAuthProvidersStore } from "../store/authProviders";
import { disconnectAuthProviderReq, getAuthProvidersReq, getUserAuthProvidersReq } from "./api/requests/player";

export async function loadAuthProviders() {
    const { setAuthProviders } = useAuthProvidersStore();
    const data = await getAuthProvidersReq();

    if (data) {
        setAuthProviders(data);
    }
}

export async function loadUserAuthProviders() {
    const { setUserAuthProviders } = useAuthProvidersStore();
    const data = await getUserAuthProvidersReq();

    if (data) {
        setUserAuthProviders(data);
    }
}

export async function disconnectAuthProvider(id: number) {
    const { clearState } = useAuthProvidersStore();

    await disconnectAuthProviderReq(id);

    clearState();
}
