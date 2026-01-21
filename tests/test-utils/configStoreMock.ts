import { reactive, ref } from "vue";

import { UnityConfig } from "../../types/configProjectTypes";

export type DefaultProjectConfigMock = UnityConfig & {
    ACHIEV_ID?: Record<string, number>;
    AFFB_ID_COOKIE?: string;
    AFFB_ID_DEFAULT?: string;
    AFFB_ID_NEW_PARTNERS?: string;
    ALL_LEVELS?: number[];
    AVAILABLE_LOCALES?: Record<string, boolean>;
    BANNER_CATEGORY_131811_SHOW?: string;
    BANNER_CATEGORY_131811__HIDE?: string;
    BANNER_CATEGORY_JACKPOTS?: string;
    BANNER_CATEGORY_TERMS_CONDITIONS?: string;
    CHAT_ID?: number;
    CONFIG_DEFAULT_COLLECTIONS_MENU_SLUGS?: Record<string, string[]>;
    COOKIE_BY_LOCALE?: Record<string, string>;
    CoinShopPageSlug?: string;
    DEFAULT_COUNTRY?: string;
    DEFAULT_LOCALE_BY_COUNTRY?: Record<string, string>;
    DEFAULT_QUEST_SIZE?: string;
    DEFAULT_STAGS_COUNTRY_REFER?: Record<string, string>;
    LIMIT_TYPE_COOLING_OFF?: string;
    LIMIT_TYPE_DEPOSIT?: string;
    PROJECT?: string;
    SPECIAL_GAME_PROVIDER_NAME?: string;
    ENABLE_CURRENCIES?: string[];
    ENABLED_NOTICES_USER_GROUP_IDS?: number[];
    GROUP_HIDE_SOFORT?: number;
    ID_CASHBOX_ONBOARD_DONE?: number;
    ID_GROUP_FOR_MULTI_ACC?: number;
    ID_GROUP_FOR_PAIRED_ID?: number;
    ID_GROUP_FOR_UNPAIRED_ID?: number;
    currencyDefault?: string;
    defaultDepCount?: number;
    featureFlags?: {
        enableAllProviders?: boolean;
        enableMysticJackpots?: boolean;
    };
    formatDateVipAdv?: string;
    gameCategorySlugs?: Record<string, string>;
    getCentrifugeUrl?: (url: string) => string;
    getGameImagePath?: (identifier: string) => string;
    getI18n?: () => { global: { t: (key: string) => string } };
    getStateByCounty?: () => string | null;
    getTargetWallets?: (wallets: Array<{ currency?: string }>) => string[];
    getUserIsDiamond?: (group?: string) => boolean;
    getUserVipGroup?: (groups: Array<string | number>) => string | undefined;
    idlePageTitle?: {
        enabled: boolean;
        changeDelay: number;
        idleStartDelay: number;
    };
    linkProfile?: string;
    LOCALES?: Record<string, string>;
    LOOTBOX_TYPE_GIFTS?: string[];
    MAIN_LOCALES_AND_DOMAINS?: Record<string, string>;
    metaDataSSR?: () => { title: string; description: string; content: string };
    ORGANIZATION_ID?: string;
    PAYMENT_HIDE_SOFORT?: string;
    PRODUCT_ID?: string;
    REFERRER_COOKIE_NAME?: string;
    REFERRER_SOURCES?: string[];
    routeNames?: Record<string, string>;
    shouldDisplayRegistrationBanner?: () => () => boolean;
    // srcPaymentImage?: (method: unknown) => unknown;
    STAG_PARTNER_COOKIE?: string;
    STATUSES_GIFT_ISSUED?: string;
    STATUSES_LOST_GIFT?: string[];
    TEST_GROUP_ID?: number;
    TOURNAMENT_IDS_FOR_ACHIEV?: number[];
    TYPE_GIFT_BONUS?: string;
    TYPE_GIFT_DEPOSIT?: string;
    TYPE_GIFT_FS?: string;
    TYPE_GIFT_REGISTRATION?: string;
    VIP_ADV_GROUP?: string | number;
    VIP_CLUB_STATUSES?: Record<string, string>;
    YOUR_SITE_ID?: string;
    config?: Record<string, unknown>;
    eventsHandlers?: Record<string, (...args: unknown[]) => unknown>;
    excludeNotificationTitles?: string[];
    logo?: string;
    logoMob?: string;
    [key: string]: unknown;
};

export type DefaultConfigMock = {
    gamesPageLimit?: number;
    $defaultProjectConfig?: DefaultProjectConfigMock;
};

export function createConfigStoreMock(overrides: Partial<DefaultConfigMock> = {}) {
    const baseProjectConfig: DefaultProjectConfigMock = {
        ACHIEV_ID: {
            EMAIL_CONFIRM: 1,
            EMAIL_CONFIRM_AND_MORE: 2,
            EXCHANGE_COIN: 3,
            COMPOINT_CHANGE: 4,
            DEP_PS: 5,
            DEP_COUNT: 6,
        },
        ALL_LEVELS: [],
        AVAILABLE_LOCALES: { en: true },
        BANNER_CATEGORY_131811_SHOW: "show",
        BANNER_CATEGORY_131811__HIDE: "hide",
        BANNER_CATEGORY_JACKPOTS: "jackpots",
        BANNER_CATEGORY_TERMS_CONDITIONS: "terms",
        CHAT_ID: 1,
        CONFIG_DEFAULT_COLLECTIONS_MENU_SLUGS: {
            MAIN_PAGE_CATEGORIES: [],
            POKIES_PAGE_CATEGORIES: [],
            LIVE_PAGE_CATEGORIES: [],
            CATEGORY_PAGE_CATEGORIES: [],
            PRODUCER_PAGE_CATEGORIES: [],
            FAVORITE_PAGE_CATEGORIES: [],
        },
        COOKIE_BY_LOCALE: { en: "en" },
        CoinShopPageSlug: "coin-shop",
        DEFAULT_COUNTRY: "US",
        DEFAULT_LOCALE_BY_COUNTRY: { US: "en" },
        DEFAULT_QUEST_SIZE: "default",
        DEFAULT_STAGS_COUNTRY_REFER: {
            CA: {
                google: "111111",
                bing: "111111",
                yahoo: "111111",
            },
        },
        LIMIT_TYPE_COOLING_OFF: "cooling_off",
        LIMIT_TYPE_DEPOSIT: "deposit",
        PROJECT: "project",
        SPECIAL_GAME_PROVIDER_NAME: "special_provider",
        ENABLE_CURRENCIES: [ "GBP",
            "AUD",
            "CAD",
            "NZD",
            "EUR",
            "USD",
            "JPY",
            "NOK",
            "BRL",
            "BTC",
            "ETH",
            "BCH",
            "LTC",
            "DOG",
            "USDT" ],
        ENABLED_NOTICES_USER_GROUP_IDS: [ 1, 2 ],
        GROUP_HIDE_SOFORT: 100,
        ID_CASHBOX_ONBOARD_DONE: 0,
        ID_GROUP_FOR_MULTI_ACC: 0,
        ID_GROUP_FOR_PAIRED_ID: 0,
        ID_GROUP_FOR_UNPAIRED_ID: 0,
        currencyDefault: "EUR",
        defaultDepCount: 2,
        featureFlags: {
            enableAllProviders: true,
            enableMysticJackpots: false,
            enableConpoints: true,
        },
        filterIssuedLootBoxes: (lootboxes) => {
            return lootboxes.filter((lootbox) => {
                return lootbox.stage === "issued" && String(lootbox.group_key || "").startsWith("wheel");
            });
        },
        formatDateVipAdv: "YYYY-MM-DD",
        gameCategorySlugs: {
            top: "top",
            new: "new",
            bonusWagering: "bonus",
            mysticJackpots: "mystic",
            jackpot: "jackpot",
            live: "live",
        },
        getCentrifugeUrl: (url: string) => url,
        getGameImagePath: (identifier: string) => `/images/${ identifier }.png`,
        getI18n: () => ({
            global: {
                t: (key: string) => key,
            },
        }),
        getQuestConfig: () => ({ mockLevels: {} }),
        getStateByCounty: () => null,
        getTargetWallets: (wallets) => wallets.map((wallet) => wallet.currency || ""),
        getUserIsDiamond: () => false,
        getUserVipGroup: () => undefined,
        idlePageTitle: {
            enabled: false,
            changeDelay: 0,
            idleStartDelay: 0,
        },
        linkProfile: "/profile/",
        LOCALES: { en: "en" },
        LOOTBOX_TYPE_GIFTS: [ "random" ],
        MAIN_LOCALES_AND_DOMAINS: { en: "example.com" },
        mapLevelItem: (status) => ({
            id: status.id,
            image: status.image || "mocked.png",
            status: status.status,
            name: status.name || "Mocked Level",
            levelNumber: 99,
            min: 0,
            max: 0,
        }),
        metaDataSSR: () => ({
            title: "SSR Title",
            description: "SSR Description",
            content: "SSR Content",
        }),
        ORGANIZATION_ID: "org",
        PAYMENT_HIDE_SOFORT: "test_hide_payment",
        PRODUCT_ID: "product",
        REFERRER_COOKIE_NAME: "referrer",
        REFERRER_SOURCES: [],
        routeNames: {
            main: "main",
        },
        shouldDisplayRegistrationBanner: () => () => true,
        srcPaymentImage: (method) => method,
        STAG_PARTNER_COOKIE: "stag",
        stagConsts: {
            AFFB_ID_COOKIE: "affb_id",
            AFFB_ID_DEFAULT: "default",
            AFFB_ID_NEW_PARTNERS: "",
            AFFB_ID_KEY: "affb_id",
            STAG_PARTNER_KEY: "partner-stag",
            DEFAULT_STAGS_COUNTRY_REFER: {},
            STAG_PARTNER_COOKIE: "stag",
            REFERRER_SOURCES: [],
        },
        STATUSES_GIFT_ISSUED: "issued",
        STATUSES_LOST_GIFT: [ "finished", "canceled", "expired", "wager_done", "lost" ],
        TEST_GROUP_ID: 0,
        toast: { show: () => undefined },
        TOURNAMENT_IDS_FOR_ACHIEV: [ 100, 101 ],
        TYPE_GIFT_BONUS: "bonus",
        TYPE_GIFT_DEPOSIT: "deposit",
        TYPE_GIFT_FS: "fs",
        TYPE_GIFT_REGISTRATION: "registration",
        USER_STATUSES: {},
        VIP_ADV_GROUP: "vip_adv_group",
        VIP_CLUB_STATUSES: {},
        YOUR_SITE_ID: "site",
        config: {
            freshChat: {
                token: "token",
                widgetUuid: "widgetUuid",
            },
            theme: "theme-light",
        },
        eventsHandlers: new Proxy({}, {
            get: () => (notice: unknown) => notice,
        }),
        excludeNotificationTitles: [ "EXCLUDED_TITLE" ],
        logo: "mocked-logo.svg",
        logoMob: "mocked-logo-mob.svg",
    };

    const projectConfig: DefaultProjectConfigMock = {
        ...baseProjectConfig,
        ...overrides.$defaultProjectConfig,
        featureFlags: {
            ...baseProjectConfig.featureFlags,
            ...overrides.$defaultProjectConfig?.featureFlags,
        },
    };

    return {
        useConfigStore: () => reactive({
            gamesPageLimit: ref(overrides.gamesPageLimit ?? 20),
            $defaultProjectConfig: projectConfig,
        }),
    };
}
