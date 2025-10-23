import featureFlags from "@theme/configs/featureFlags";
import { storeToRefs } from "pinia";

import type { ICollectionItem, IDisabledGamesProvider, IGame, IGamesProvider } from "../../../models/game";
import { GameDisableGeoStatus } from "../../../models/game";
import { useRootStore } from "../../../store/root";
import { useCommon } from "../../common";
import { useContextStore } from "../../context";

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
            if (game.devices.length > 1) {
                return true;
            }

            if (game.devices[0] === "mobile") {
                return rootStore.isMobile;
            }

            return true;
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

export function filterDisabledProviders(
    data: (IGamesProvider | IGame)[], disabledGamesProviders: IDisabledGamesProvider,
): (IGamesProvider | IGame)[] {
    const { isBotUA } = storeToRefs(useContextStore());
    const enableFilter = disabledGamesProviders && data && !featureFlags.enableAllProviders && !isBotUA.value;

    if (enableFilter) {
        const { currentIpInfo } = storeToRefs(useCommon());
        const hasData = Object.keys(disabledGamesProviders).length && Array.isArray(data);

        if (hasData) {
            return data.filter((dataItem: IGame | IGamesProvider) => {
                const providerName = dataItem.provider;
                const currentDisabledProviderOpts = disabledGamesProviders[providerName];

                if (currentDisabledProviderOpts === GameDisableGeoStatus.all) {
                    return false;
                } else if (Array.isArray(currentDisabledProviderOpts)) {
                    return !currentDisabledProviderOpts.includes(String(currentIpInfo.value?.country_code));
                }

                return true;
            });
        }
    }

    return data;
}
