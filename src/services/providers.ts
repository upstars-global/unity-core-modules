import type { IDisabledGamesProvider } from "../models/game";
import { loadDisabledProvidersConfigReq } from "../services/api/requests/configs";
import { useGamesProviders } from "../store/games/gamesProviders";

interface IProvidersList {
    [key: string]: string | string[];
}

export async function loadDisabledGamesProviders(): Promise<void> {
    const { setDisabledGamesProviders } = useGamesProviders();

    const data: IProvidersList = await loadDisabledProvidersConfigReq();

    if (data) {
        const first10Props: IProvidersList = {};

        Object.entries(data).slice(0, 10).forEach(([ key, value ]) => {
            first10Props[key] = value;
        });

        setDisabledGamesProviders(first10Props as IDisabledGamesProvider);
    }
}
