import { storeToRefs } from "pinia";
import { useConfigStore } from "src/store/configStore";

import { isExistData } from "../helpers/isExistData";
import type { IDisabledGamesProvider } from "../models/game";
import { useGamesProviders } from "../store/games/gamesProviders";
import { loadDisabledProvidersConfigReq } from "./api/requests/configs";

export async function loadDisabledGamesProviders(): Promise<void> {
    const gamesProviders = useGamesProviders();
    const configStore = useConfigStore();
    const { disabledGamesProviders } = storeToRefs(gamesProviders);

    if (isExistData(disabledGamesProviders.value)) {
        return;
    }

    const data = await loadDisabledProvidersConfigReq();

    if (data) {
        const first20Props: IDisabledGamesProvider = {};

        Object.keys(data).forEach((key) => {
            first20Props[key] = data[key];
        });

        gamesProviders.setDisabledGamesProviders(first20Props as IDisabledGamesProvider);
        configStore.setDisabledGamesProviders(first20Props as IDisabledGamesProvider);
    }
}
