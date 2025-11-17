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
    const { setUserAuthProviders, setUserAuthProvidersLoadedStatus } = useAuthProvidersStore();
    const data = await getUserAuthProvidersReq();

    setUserAuthProvidersLoadedStatus(true);

    if (data) {
        setUserAuthProviders(data);
    }
}

export async function disconnectAuthProvider(id: number) {
    const { clearState } = useAuthProvidersStore();

    const data = await disconnectAuthProviderReq(id);

    if (data?.status === 200) {
        clearState();
    }
}
