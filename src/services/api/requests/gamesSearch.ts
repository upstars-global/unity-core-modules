import { storeToRefs } from "pinia";

import { log } from "../../../controllers/Logger";
import {
    filterGames,
    type IGameItem,
    type IGameItemFilter,
    matchSearchAliasGames,
    processGameForNewAPI,
} from "../../../helpers/gameHelpers";
import { type ISearchAliasConfig } from "../../../models/configs";
import { type IDisabledGamesProvider, type IEnabledGames } from "../../../models/game";
import { useGamesProviders } from "../../../store/games/gamesProviders";
import { useGamesCommon } from "../../../store/games/gamesStore";
import { useRootStore } from "../../../store/root";
import { http } from "../http";
import { loadSearchAliasConfigReq } from "./configs";
import { loadGamesByIdsReq } from "./games";

let aliasConfigRequest: Promise<ISearchAliasConfig | undefined> | undefined = undefined;

function getSearchAliasConfig() {
    if (!aliasConfigRequest) {
        aliasConfigRequest = loadSearchAliasConfigReq().then((config) => {
            if (!config) {
                aliasConfigRequest = undefined;
            }

            return config;
        });
    }

    return aliasConfigRequest;
}

async function loadAliasGames(
    searchString: string,
    device: string,
    disabledGamesProviders: IDisabledGamesProvider,
    enabledGamesConfig: IEnabledGames,
): Promise<IGameItem[]> {
    const config = await getSearchAliasConfig();
    const gameIds = matchSearchAliasGames(searchString, config);

    if (!gameIds.length) {
        return [];
    }

    const games = Object.values(await loadGamesByIdsReq(gameIds, device));

    return filterGames(games.map(processGameForNewAPI), disabledGamesProviders, enabledGamesConfig);
}

export async function loadFoundGames(searchString: string) {
    try {
        const { isMobile } = useRootStore();
        const { disabledGamesProviders } = storeToRefs(useGamesProviders());
        const { enabledGamesConfig } = storeToRefs(useGamesCommon());
        const device = isMobile ? "mobile" : "desktop";

        const { data } = await http().post<{ data: IGameItemFilter[] }>("/api/games_filter", {
            device,
            filter: {
                title: searchString,
            },
        });

        const foundGames = filterGames(
            data.data.map(processGameForNewAPI),
            disabledGamesProviders.value,
            enabledGamesConfig.value,
        );

        if (foundGames.length > 0) {
            return foundGames;
        }

        return await loadAliasGames(searchString, device, disabledGamesProviders.value, enabledGamesConfig.value);
    } catch (err) {
        log.error("LOAD_FOUND_GAMES_ERROR", err);
        return [];
    }
}
