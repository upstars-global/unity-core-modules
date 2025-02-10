import { BOTTOM_MENU, CUSTOM_PAGE_TYPE, PAGE, TOP_MENU_TYPE } from "../consts/staticPages";
import type { IPageCMSPrepare } from "../models/CMS";
import type { IPageItemConfig } from "../services/api/DTO/CMS";

function getPage(page: IPageItemConfig): IPageCMSPrepare {
    return {
        slug: page.path,
        url: `/${page.path}`,
        hidden: false,
        pageType: "static",
        ...page,
    };
}

export function prepareMapStaticPages(pages: IPageItemConfig[]): IPageCMSPrepare[] {
    const filteredPages: IPageCMSPrepare[] = [];

    function recursivePreparePages(childPages: IPageItemConfig[]) {
        childPages.forEach((childPage) => {
            const result = getPage(childPage);

            if (result) {
                filteredPages.push(result);
            }

            if (childPage.children) {
                recursivePreparePages(childPage.children);
            }
        });
    }

    recursivePreparePages(pages);

    return filteredPages;
}

const STATIC_PAGE_CATEGORIES = [ CUSTOM_PAGE_TYPE, TOP_MENU_TYPE, BOTTOM_MENU, PAGE ];

export function filterStaticPages(allPages) {
    return allPages.filter((page) => {
        return page.categories.some((categoryItem) => {
            return STATIC_PAGE_CATEGORIES.includes(categoryItem);
        });
    });
}
