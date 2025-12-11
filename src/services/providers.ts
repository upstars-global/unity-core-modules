import type { IDisabledGamesProvider } from "../models/game";
import { useGamesProviders } from "../store/games/gamesProviders";
import { loadDisabledProvidersConfigReq } from "./api/requests/configs";

export async function loadDisabledGamesProviders(): Promise<void> {
    const gamesProviders = useGamesProviders();

    const data = await loadDisabledProvidersConfigReq();

    if (data) {
        const first20Props: IDisabledGamesProvider = {};

        Object.keys(data).forEach((key) => {
            first20Props[key] = data[key];
        });

        gamesProviders.setDisabledGamesProviders(first20Props as IDisabledGamesProvider);
    }
}
