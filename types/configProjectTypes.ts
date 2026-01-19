
export type MenuCollectionsName =
    | "MAIN_PAGE_CATEGORIES"
    | "POKIES_PAGE_CATEGORIES"
    | "LIVE_PAGE_CATEGORIES"
    | "CATEGORY_PAGE_CATEGORIES"
    | "PRODUCER_PAGE_CATEGORIES"
    | "FAVORITE_PAGE_CATEGORIES";

// базовый slug по умолчанию
export type CategorySlug = string;

// точка расширения под проект
export interface ProjectConfigOverrides {
    CategorySlug?: CategorySlug;
}

export type ResolvedCategorySlug =
    ProjectConfigOverrides["CategorySlug"] extends string
        ? ProjectConfigOverrides["CategorySlug"]
        : CategorySlug;

export type ProjectConfig = {
    CONFIG_DEFAULT_COLLECTIONS_MENU_SLUGS: Record<MenuCollectionsName, ResolvedCategorySlug[]>;
};
export type UnityConfig = {
    ENABLE_CURRENCIES: string[];
    currencyDefault: string;
    DEFAULT_COUNTRY?: string;
    DEFAULT_LOCALE_BY_COUNTRY: Record<string, string>;
    PROJECT: string;
    getStateByCounty: (a: string, b: string) => null | Record<string, unknown>;
    CONFIG_DEFAULT_COLLECTIONS_MENU_SLUGS: ProjectConfig["CONFIG_DEFAULT_COLLECTIONS_MENU_SLUGS"];
    logo: string;
    logoMob: string;
    featureFlags: Record<string, boolean>;
    ACHIEV_ID: Record<string, number>,
    defaultDepCount: number,
    TOURNAMENT_IDS_FOR_ACHIEV: string[]
    config: Record<string, unknown>
    metaDataSSR: () => unknown
    routeNames: Record<string, string>
    SPECIAL_GAME_PROVIDER_NAME: string
}
