import type { IDisabledGamesProvider } from "../models/game";
import { IProvidersList } from "../models/providers";
import { loadDisabledProvidersConfigReq } from "../services/api/requests/configs";
import { useGamesProviders } from "../store/games/gamesProviders";

export async function loadDisabledGamesProviders(): Promise<void> {
    const { setDisabledGamesProviders } = useGamesProviders();

    const data = await loadDisabledProvidersConfigReq();

    if (data) {
        const first10Props: IProvidersList = {};

        Object.keys(data).slice(0, 10).forEach((key) => {
            first10Props[key] = data[key];
        });

        setDisabledGamesProviders(first10Props as IDisabledGamesProvider);
    }
}
