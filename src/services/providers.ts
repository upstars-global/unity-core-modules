import { storeToRefs } from "pinia";
import { ensureStoreData } from "unity-core-modules/src/helpers/ensureStoreData";

import type { IDisabledGamesProvider } from "../models/game";
import { loadDisabledProvidersConfigReq } from "../services/api/requests/configs";
import { useGamesProviders } from "../store/games/gamesProviders";

export async function loadDisabledGamesProviders(): Promise<void> {
    const gamesProviders = useGamesProviders();
    const { disabledGamesProviders } = storeToRefs(gamesProviders);

    const data = await ensureStoreData(disabledGamesProviders.value, loadDisabledProvidersConfigReq);

    if (data) {
        const first20Props: IDisabledGamesProvider = {};

        Object.keys(data).slice(0, 20).forEach((key) => {
            first20Props[key] = data[key];
        });

        gamesProviders.setDisabledGamesProviders(first20Props as IDisabledGamesProvider);
    }
}
