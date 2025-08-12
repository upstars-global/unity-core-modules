import type { IDisabledGamesProvider } from "../models/game";
import { loadDisabledProvidersConfigReq } from "../services/api/requests/configs";
import { useGamesProviders } from "../store/games/gamesProviders";

export async function loadDisabledGamesProviders(): Promise<void> {
    const { setDisabledGamesProviders } = useGamesProviders();

    const data = await loadDisabledProvidersConfigReq();

    if (data) {
        setDisabledGamesProviders(data as IDisabledGamesProvider);
    }
}
