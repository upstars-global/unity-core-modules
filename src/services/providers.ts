import type { IDisabledGamesProvider } from "../models/game";
import { loadDisabledProvidersConfigReq } from "../services/api/requests/configs";
import { useGamesProviders } from "../store/games/gamesProviders";

export async function loadDisabledGamesProviders(): Promise<void> {
    const providers = useGamesProviders();

    if (Object.keys(providers.disabledGamesProviders).length) {
        return;
    }

    const data = await loadDisabledProvidersConfigReq();

    if (data) {
        providers.setDisabledGamesProviders(data as IDisabledGamesProvider);
    }
}
