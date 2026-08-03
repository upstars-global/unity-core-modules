// @ts-expect-error -- TS2307: Cannot find module '@router/routeNames' or its corresponding type declarations.
import { routeNames } from "@router/routeNames";

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

// @ts-expect-error -- TS7006: Parameter 'allPages' implicitly has an 'any' type.
export function filterStaticPages(allPages) {
    // @ts-expect-error -- TS7006: Parameter 'page' implicitly has an 'any' type.
    return allPages.filter((page) => {
        // @ts-expect-error -- TS7006: Parameter 'categoryItem' implicitly has an 'any' type.
        return page.categories.some((categoryItem) => {
            return STATIC_PAGE_CATEGORIES.includes(categoryItem);
        });
    });
}

export function resolveUrlFromRoute(route: { path: string; name?: string; meta?: { metaUrl?: string } }): string {
    if (route?.meta?.metaUrl) {
        return route.meta.metaUrl;
    }

    if (route?.name === routeNames.main) {
        return "/home";
    }
    return route?.path ?? "";
}

export function normalizeUrl(url: string): string {
    return url.replace(/^\/+|\/+$/g, "");
}
