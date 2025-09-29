import type { IDisabledGamesProvider } from "../models/game";
import { loadDisabledProvidersConfigReq } from "../services/api/requests/configs";
import { useGamesProviders } from "../store/games/gamesProviders";

export async function loadDisabledGamesProviders(): Promise<void> {
    const { setDisabledGamesProviders } = useGamesProviders();

    const data = await loadDisabledProvidersConfigReq();

    if (data) {
        const first20Props: IDisabledGamesProvider = {};

        Object.keys(data).slice(0, 20).forEach((key) => {
            first20Props[key] = data[key];
        });

        setDisabledGamesProviders(first20Props as IDisabledGamesProvider);
    }
}
