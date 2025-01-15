import { COUNTRIES } from "@theme/configs/constsLocales";
import { storeToRefs } from "pinia";

import type { ICollectionItem, IGame } from "../../../models/game";
import { useMultilangStore } from "../../multilang";

// tslint:disable-next-line:max-line-length
function findGameBySeoTittleAndProducerWithDuplicate(gamesCollection: IGame[], { producer, seoTitle }): IGame | undefined {
    return gamesCollection.find(({ seo_title: seoTitleItem, provider: providerItem }) => {
        return producer === providerItem && seoTitleItem === seoTitle;
    });
}

function findGameOfPlaysonBySeoTitle(gamesCollection: IGame[], { producer, seoTitle }): IGame | undefined {
    const { getUserGeo: userGeo } = storeToRefs(useMultilangStore());
    const producersByGeo = {
        [COUNTRIES.AUSTRALIA]: "redgenn",
        [COUNTRIES.ITALY]: "redgenn",
    };
    const targetProducerByGeo = producersByGeo[userGeo.value] || "infin";
    return gamesCollection.find(({ seo_title: seoTitleItem, identifier: identifierItem }) => {
        const [ producerItem ] = identifierItem.split("/");
        return targetProducerByGeo === producerItem && seoTitleItem === seoTitle;
    });
}

export function findGameBySeoTittleAndProducer(gamesCollection: IGame[], { producer, seoTitle }): IGame | undefined {
    if (producer === "playson") {
        return findGameOfPlaysonBySeoTitle(gamesCollection, { producer, seoTitle });
    }
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
