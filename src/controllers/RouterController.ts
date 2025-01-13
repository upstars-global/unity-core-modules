import type { RouteComponent, RouteRecordRaw } from "vue-router";

import { filterStaticPages } from "../helpers/staticPages";

// @ts-expect-error Parameters implicitly have an 'any' type.
export function generateStaticRoutes(routerData, staticPageComp: RouteComponent) {
    if (routerData) {
        let staticPagesData = routerData;
        if (routerData?.CMS?.staticPages) {
            staticPagesData = routerData.CMS.staticPages;
        }

        const pages: RouteRecordRaw[] = [];
        filterStaticPages(staticPagesData)
        // @ts-expect-error Parameters implicitly have an 'any' type.
            .forEach((staticPage) => {
                pages.push(
                    {
                        path: staticPage.slug,
                        name: staticPage.slug,
                        component: staticPageComp,
                        props: () => {
                            return { ...staticPage };
                        },
                    },
                );
            });

        return pages;
    }
    return [];
}

// @ts-expect-error Parameters implicitly have an 'any' type.
export function getStaticRoutes(routerData, staticPageComp: RouteComponent) {
    return [
        {
            path: "/",
            children: generateStaticRoutes(routerData, staticPageComp),
        },
    ];
}
