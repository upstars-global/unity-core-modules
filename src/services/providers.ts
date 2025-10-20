import { storeToRefs } from "pinia";

import { isExistData } from "../helpers/isExistData";
import type { IDisabledGamesProvider } from "../models/game";
import { useGamesProviders } from "../store/games/gamesProviders";
import { loadDisabledProvidersConfigReq } from "./api/requests/configs";

export async function loadDisabledGamesProviders(): Promise<void> {
    const gamesProviders = useGamesProviders();
    const { disabledGamesProviders } = storeToRefs(gamesProviders);

    if (isExistData(disabledGamesProviders)) {
        return;
    }

    const data = await loadDisabledProvidersConfigReq();

    if (data) {
        const first20Props: IDisabledGamesProvider = {};

        Object.keys(data).slice(0, 20).forEach((key) => {
            first20Props[key] = data[key];
        });

        gamesProviders.setDisabledGamesProviders(first20Props as IDisabledGamesProvider);
    }
}
