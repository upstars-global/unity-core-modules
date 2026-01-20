import { useRoute } from "vue-router";

import { useConfigStore } from "../store/configStore";
export interface IBadge {
    background: string;
    color: string;
    text: string;
}

export interface IItemMenu {
    title: string;
    routeName: string | null;
    externalUrl?: string;
    image?: string;
    badge?: IBadge;
    url?: string;
    to?: string;
    hide?: boolean;
    clickFn?: (item: IItemMenu) => void;
}

export const useGetActiveClass = () => {
    const { $defaultProjectConfig } = useConfigStore();
    const { routeNames } = $defaultProjectConfig;
    const $route = useRoute();

    // @ts-expect-error Parameter 'isActive' implicitly has an 'any' type.
    function getActiveClass(item: IItemMenu, isActive, hiddenItems: string[] = []): string[] | { active: boolean } {
        if (hiddenItems.includes(item.title)) {
            return [ "item-hidden" ];
        }

        let active = isActive;
        if (!$route) {
            return { active };
        }
        item.routeName = item.routeName || null;

        if (item.routeName === routeNames.main) {
            active = $route.fullPath === "/" ||
                $route.fullPath.startsWith("/categories") ||
                $route.fullPath.startsWith("/games");
        }

        if (item.routeName === routeNames.categoryPokiesAll) {
            active = $route.fullPath.startsWith("/pokies");
        }

        if (item.routeName === routeNames.categoryLiveAll) {
            active = $route.fullPath.startsWith("/live");
        }
        // @ts-expect-error Property 'categorySlotsAll' does not exist on type
        if (item.routeName === routeNames.categorySlotsAll) {
            active = $route.fullPath.startsWith("/slots");
        }

        if (
            item.routeName === routeNames.arena ||
            item.routeName === routeNames.action ||
            item.routeName === routeNames.tournaments ||
            // @ts-expect-error Property 'quests' does not exist on type
            item.routeName === routeNames.quests
        ) {
            const currentRoute = $route.fullPath;
            active = (currentRoute.startsWith("/arena") ||
                    currentRoute.startsWith("/promo") ||
                    currentRoute.startsWith("/tournaments") ||
                    currentRoute.startsWith("/quests")) &&
                currentRoute !== "/promotions" ||
                currentRoute.startsWith("/leaderboard");
        }

        return { active };
    }

    return {
        getActiveClass,
    };
};
