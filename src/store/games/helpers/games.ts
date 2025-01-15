import type { ICollectionItem, IGame } from "../../../models/game";

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
