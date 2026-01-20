import { storeToRefs } from "pinia";

import { IGameItem } from "../../../helpers/gameHelpers";
import type { ICollectionItem, IGame, IGamesProvider } from "../../../models/game";
import { GameDisableGeoStatus, IEnabledGames } from "../../../models/game";
import { useCommon } from "../../common";
import { useConfigStore } from "../../configStore";
import { useContextStore } from "../../context";
import { useRootStore } from "../../root";
import { useGamesProviders } from "../gamesProviders";
import { useGamesCommon } from "../gamesStore";


type IFindGameParams = {
    producer: string;
    seoTitle: string;
};

function findGameBySeoTittleAndProducerWithDuplicate(
    gamesCollection: IGame[],
    { producer, seoTitle }: IFindGameParams,
): IGame | undefined {
    const rootStore = useRootStore();
    return gamesCollection
        .filter((game: IGame) => {
            return game.devices.length > 1 ||
            game.devices.includes(rootStore.isMobile ? "mobile" : "desktop");
        })
        .find(({ seo_title: seoTitleItem, provider: providerItem }) => {
            return producer === providerItem && seoTitleItem === seoTitle;
        });
}

export function findGameBySeoTittleAndProducer(
    gamesCollection: IGame[],
    { producer, seoTitle }: IFindGameParams,
): IGame | undefined {
    return findGameBySeoTittleAndProducerWithDuplicate(gamesCollection, { producer, seoTitle });
}

export function defaultCollection(): ICollectionItem {
    return {
        data: [],
        pagination: {
            current_page: 0,
            next_page: undefined,
            prev_page: undefined,
            total_pages: 0,
            total_count: 0,
        },
    };
}

function getCountryCode(): string | undefined {
    const { currentIpInfo } = storeToRefs(useCommon());
    return currentIpInfo.value?.country_code;
}

export function isProviderAllowed(
    providerId: string,
    disabledMap: Record<string, GameDisableGeoStatus | string[]> | undefined,
    country?: string,
): boolean {
    if (!disabledMap) {
        return true;
    }
    const rules = disabledMap[providerId];
    if (!rules) {
        return true;
    }
    if (rules === GameDisableGeoStatus.all) {
        return false;
    }
    if (Array.isArray(rules)) {
        return !rules.includes(String(country));
    }
    return true;
}

export function isGameAllowed(
    identifier: string,
    enabledMap: IEnabledGames | undefined,
    country?: string,
): boolean {
    if (!enabledMap) {
        return true;
    }
    const whitelist = enabledMap[identifier];
    if (Array.isArray(whitelist)) {
        return whitelist.includes(String(country));
    }
    return true;
}

export function filterProviders(
    data: IGamesProvider[],
): IGamesProvider[] {
    const { isBotUA } = storeToRefs(useContextStore());
    const { disabledGamesProviders } = storeToRefs(useGamesProviders());
    const { $defaultProjectConfig } = useConfigStore();

    if (!Array.isArray(data) || $defaultProjectConfig.featureFlags.enableAllProviders || isBotUA.value) {
        return data;
    }

    const disabledMap = disabledGamesProviders.value;
    if (!disabledMap || Object.keys(disabledMap).length === 0) {
        return data;
    }

    const country = getCountryCode();
    return data.filter((item) => isProviderAllowed(item.provider, disabledMap, country));
}

export function filterGames<T extends IGame | IGameItem>(
    data: T[],
): T[] {
    const { isBotUA } = storeToRefs(useContextStore());
    const { disabledGamesProviders } = storeToRefs(useGamesProviders());
    const { enabledGamesConfig } = storeToRefs(useGamesCommon());
    const { $defaultProjectConfig } = useConfigStore();

    if (!Array.isArray(data) || $defaultProjectConfig.featureFlags.enableAllProviders || isBotUA.value) {
        return data;
    }

    const disabledMap = disabledGamesProviders.value;
    const enabledMap = enabledGamesConfig.value;
    const hasConfigs =
        Boolean(disabledMap && Object.keys(disabledMap).length) ||
        Boolean(enabledMap && Object.keys(enabledMap).length);

    if (!hasConfigs) {
        return data;
    }

    const country = getCountryCode();
    return data.filter(
        (game) =>
            isProviderAllowed(game.provider, disabledMap, country) &&
            isGameAllowed(game.identifier, enabledMap as IEnabledGames | undefined, country),
    );
}
