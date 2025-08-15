import featureFlags from "@theme/configs/featureFlags";
import { storeToRefs } from "pinia";

import type { ICollectionItem, IDisabledGamesProvider, IGame, IGamesProvider } from "../../../models/game";
import { GameDisableGeoStatus } from "../../../models/game";
import { useCommon } from "../../common";
import { useUserInfo } from "../../user/userInfo";

// tslint:disable-next-line:max-line-length
function findGameBySeoTittleAndProducerWithDuplicate(gamesCollection: IGame[], { producer, seoTitle }): IGame | undefined {
    return gamesCollection.find(({ seo_title: seoTitleItem, provider: providerItem }) => {
        return producer === providerItem && seoTitleItem === seoTitle;
    });
}

export function findGameBySeoTittleAndProducer(gamesCollection: IGame[], { producer, seoTitle }): IGame | undefined {
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
    const { getIsLogged } = storeToRefs(useUserInfo());
    const enableFilter = !featureFlags.enableAllProviders && getIsLogged.value;

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
