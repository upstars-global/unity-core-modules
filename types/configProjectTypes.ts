import type { Component } from "vue";

import type { IBannerConfig } from "../src/models/banners";
import type { ILootbox } from "../src/models/lootboxes";
import type { IPaymentsMethod } from "../src/models/PaymentsLib";
import type { UserGroup } from "../src/models/user";
import type { INotification } from "../src/models/WSnotices";
import type { IUserAccount } from "../src/services/api/DTO/playerDTO";
import type { IStatuses } from "../src/services/api/DTO/statuses";

export type MenuCollectionsName =
    | "MAIN_PAGE_CATEGORIES"
    | "POKIES_PAGE_CATEGORIES"
    | "LIVE_PAGE_CATEGORIES"
    | "CATEGORY_PAGE_CATEGORIES"
    | "PRODUCER_PAGE_CATEGORIES"
    | "FAVORITE_PAGE_CATEGORIES";


// точка расширения под проект
export interface ProjectConfigOverrides {
    CategorySlug?: string;
    Referrer?: string[];
}

export type ResolvedCategorySlug =
    ProjectConfigOverrides["CategorySlug"] extends string
        ? ProjectConfigOverrides["CategorySlug"]
        : string;

export type ResolvedReferrer =
    ProjectConfigOverrides["Referrer"] extends string
        ? ProjectConfigOverrides["Referrer"]
        : string;

export type ProjectConfig = {
    CONFIG_DEFAULT_COLLECTIONS_MENU_SLUGS: Record<MenuCollectionsName, ResolvedCategorySlug[]>;
};

export type RegistrationBannerContext = {
    userIsLogged: boolean;
    isCryptoDomain: boolean;
    isCryptoUserCurrency: boolean;
};

export type ModalShowOptions = {
    name: string;
    component: Component;
    mobileFriendly?: boolean;
    blockCloseOverlay?: boolean;
    fullScreenMobile?: boolean;
    props?: Record<string, unknown>;
};

export type ToastShowOptions = {
    text: string;
    id: number;
    type: string;
    image?: string;
};

export type I18nLike = {
    global: {
        t: (key: string) => string;
    };
};

export type UnityConfig = {
    ENABLE_CURRENCIES: string[];
    currencyDefault: string;
    DEFAULT_COUNTRY?: string;
    DEFAULT_LOCALE_BY_COUNTRY: Record<string, string>;
    COUNTRY_BY_HOST: Record<string, string>;
    LOCALES: Record<string, string>;
    AVAILABLE_LOCALES: Record<string, boolean>;
    MAIN_LOCALES_AND_DOMAINS: Record<string, string>;
    COOKIE_BY_LOCALE: Record<string, string>;
    REFERRER_COOKIE_NAME: string;
    CHAT_ID: number;
    idlePageTitle: {
        enabled: boolean;
        changeDelay: number;
        idleStartDelay: number;
    };
    PROJECT: string;
    getStateByCounty: (a: string, b: string) => null | Record<string, unknown>;
    CONFIG_DEFAULT_COLLECTIONS_MENU_SLUGS: ProjectConfig["CONFIG_DEFAULT_COLLECTIONS_MENU_SLUGS"];
    gameCategorySlugs: {
        top: ResolvedCategorySlug;
        new: ResolvedCategorySlug;
        bonusWagering: ResolvedCategorySlug;
        mysticJackpots: ResolvedCategorySlug;
        jackpot: ResolvedCategorySlug;
        live: ResolvedCategorySlug;
    };
    getGameImagePath: (identifier: string) => string;
    mapLevelItem: (status: IStatuses) => {
        id: string;
        image: string;
        status: boolean;
        name: string;
        levelNumber: number;
        min: number;
        max: number;
    };
    filterIssuedLootBoxes: (lootboxes: ILootbox[]) => ILootbox[];
    getTargetWallets: (wallets: IUserAccount[]) => string[];
    srcPaymentImage: (method: IPaymentsMethod) => IPaymentsMethod;
    shouldDisplayRegistrationBanner: (context: RegistrationBannerContext) => (banner: IBannerConfig) => boolean;
    CoinShopPageSlug: string;
    GROUP_HIDE_SOFORT: number;
    PAYMENT_HIDE_SOFORT: string;
    getQuestConfig: (questSize: string | number) => {
        mockLevels: Record<string, { bets: Record<string, number> }>;
    };
    DEFAULT_QUEST_SIZE: string;
    excludeNotificationTitles: string[];
    ENABLED_NOTICES_USER_GROUP_IDS: number[];
    eventsHandlers: Record<string, (notice: INotification) => unknown>;
    ID_GROUP_FOR_PAIRED_ID: number;
    ID_GROUP_FOR_UNPAIRED_ID: number;
    LIMIT_TYPE_COOLING_OFF: string;
    LIMIT_TYPE_DEPOSIT: string;
    formatDateVipAdv: string;
    VIP_ADV_GROUP: UserGroup;
    ALL_LEVELS: UserGroup[];
    ID_CASHBOX_ONBOARD_DONE: number;
    ID_GROUP_FOR_MULTI_ACC: number;
    TEST_GROUP_ID: number;
    VIP_CLUB_STATUSES: Record<string, string>;
    USER_STATUSES: Record<string, string>;
    getUserVipGroup: (groups: UserGroup[]) => string | undefined;
    getUserIsDiamond: (vipGroup?: string) => boolean;
    linkProfile: string;
    LOOTBOX_TYPE_GIFTS: string[];
    STATUSES_LOST_GIFT: string[];
    STATUSES_GIFT_ISSUED: string;
    TYPE_GIFT_BONUS: string;
    TYPE_GIFT_DEPOSIT: string;
    TYPE_GIFT_FS: string;
    TYPE_GIFT_REGISTRATION: string;
    getCentrifugeUrl: (url: string) => string;
    ORGANIZATION_ID: string;
    PRODUCT_ID: string;
    YOUR_SITE_ID: string;
    supportPopupComponent: Component;
    modal: { show: (options: ModalShowOptions) => void };
    toast: { show: (options: ToastShowOptions) => void };
    getI18n: () => I18nLike;
    testEnableByCountry: Record<string, boolean>;
    logo: string;
    logoMob: string;
    featureFlags: Record<string, boolean>;
    ACHIEV_ID: Record<string, number>;
    defaultDepCount: number;
    TOURNAMENT_IDS_FOR_ACHIEV: Array<string | number>;
    config: Record<string, unknown>;
    metaDataSSR: () => unknown;
    routeNames: Record<string, string>;
    SPECIAL_GAME_PROVIDER_NAME: string;
    WELCOME_PACK_STAG_ID: Record<string, boolean>;
    BANNER_CATEGORY_131811__HIDE: string;
    BANNER_CATEGORY_131811_SHOW: string;
    BANNER_CATEGORY_JACKPOTS: string;
    BANNER_CATEGORY_TERMS_CONDITIONS: string;
    stagConsts: {
        AFFB_ID_COOKIE: string;
        AFFB_ID_DEFAULT: string;
        AFFB_ID_NEW_PARTNERS: string;
        AFFB_ID_KEY: string;
        STAG_PARTNER_KEY: string;
        DEFAULT_STAGS_COUNTRY_REFER: Record<string, Record<ResolvedReferrer, string>>;
        STAG_PARTNER_COOKIE: string;
        REFERRER_SOURCES: readonly ResolvedReferrer[];
    };
};
