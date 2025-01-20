export enum SlugCategoriesGames {
    SLUG_CATEGORY_NEW = "new",
    SLUG_CATEGORY_BONUS_WAGERING = "bonus-wagering",
    SLUG_CATEGORY_MEGAWAYS = "megaways",
    SLUG_CATEGORY_BONUS_BUY = "bonus-buy",
    SLUG_CATEGORY_BLACKJACK = "blackjack",
    SLUG_CATEGORY_ROULETTE = "roulette",
    SLUG_CATEGORY_BACCARAT = "baccarat",
    SLUG_CATEGORY_POKER = "poker",
    SLUG_CATEGORY_TABLE = "table",
    SLUG_CATEGORY_MYSTIC_JACKPOTS = "mystic-jackpots",
    SLUG_CATEGORY_JACKPOT = "jackpot",
    SLUG_CATEGORY_TOP = "top",
    SLUG_CATEGORY_RECOMMENDED = "recommended",
    SLUG_CATEGORY_CRASH_GAMES = "crash-games",
    SLUG_CATEGORY_LOTTERY = "lottery",
    SLUG_CATEGORY_FISHING_GAMES = "fishing-games",
    SLUG_CATEGORY_SPECIAL = "special",
    SLUG_CATEGORY_ALL = "all",
    SLUG_CATEGORY_LIVE = "live",
    SLUG_CATEGORY_POKIES = "slots",
    SLUG_CATEGORY_WINN_WEEK = "winning-week",
    SLUG_CATEGORY_COINS = "coin",
    SLUG_CATEGORY_CRASH_WIN = "crash-win",
    SLUG_CATEGORY_POKER_CRAPS = "poker-craps",
    SLUG_CATEGORY_SPORT = "sport",
    SLUG_CATEGORY_FISHING = "fishing",
    SLUG_CATEGORY_TRENDING = "trending",
    SLUG_CATEGORY_VEGAS = "vegas",
    SLUG_CATEGORY_BINGO_KENO = "bingo-keno",
}

export enum MenuCollectionsMame {
    MAIN_PAGE_CATEGORIES = "MAIN_PAGE_CATEGORIES",
    POKIES_PAGE_CATEGORIES = "POKIES_PAGE_CATEGORIES",
    LIVE_PAGE_CATEGORIES = "LIVE_PAGE_CATEGORIES",
    CATEGORY_PAGE_CATEGORIES = "CATEGORY_PAGE_CATEGORIES",
    PRODUCER_PAGE_CATEGORIES = "PRODUCER_PAGE_CATEGORIES",
    FAVORITE_PAGE_CATEGORIES = "FAVORITE_PAGE_CATEGORIES"
}

export const MAIN_PAGE_CATEGORIES: SlugCategoriesGames[] = [
    SlugCategoriesGames.SLUG_CATEGORY_TOP,
    SlugCategoriesGames.SLUG_CATEGORY_NEW,
    SlugCategoriesGames.SLUG_CATEGORY_RECOMMENDED,
    SlugCategoriesGames.SLUG_CATEGORY_BONUS_BUY,
    SlugCategoriesGames.SLUG_CATEGORY_TABLE,
    SlugCategoriesGames.SLUG_CATEGORY_LOTTERY,
    SlugCategoriesGames.SLUG_CATEGORY_CRASH_WIN,
    SlugCategoriesGames.SLUG_CATEGORY_POKER_CRAPS,
    SlugCategoriesGames.SLUG_CATEGORY_SPORT,
    SlugCategoriesGames.SLUG_CATEGORY_FISHING,
    SlugCategoriesGames.SLUG_CATEGORY_ALL,
];

export const POKIES_PAGE_CATEGORIES: SlugCategoriesGames[] = [
    SlugCategoriesGames.SLUG_CATEGORY_TOP,
    SlugCategoriesGames.SLUG_CATEGORY_NEW,
    SlugCategoriesGames.SLUG_CATEGORY_RECOMMENDED,
    SlugCategoriesGames.SLUG_CATEGORY_BONUS_BUY,
    SlugCategoriesGames.SLUG_CATEGORY_TABLE,
    SlugCategoriesGames.SLUG_CATEGORY_LOTTERY,
    SlugCategoriesGames.SLUG_CATEGORY_CRASH_WIN,
    SlugCategoriesGames.SLUG_CATEGORY_POKER_CRAPS,
    SlugCategoriesGames.SLUG_CATEGORY_SPORT,
    SlugCategoriesGames.SLUG_CATEGORY_FISHING,
];

export const LIVE_PAGE_CATEGORIES: SlugCategoriesGames[] = [
    SlugCategoriesGames.SLUG_CATEGORY_BLACKJACK,
    SlugCategoriesGames.SLUG_CATEGORY_ROULETTE,
    SlugCategoriesGames.SLUG_CATEGORY_BACCARAT,
    SlugCategoriesGames.SLUG_CATEGORY_POKER,
];

export const CATEGORY_PAGE_CATEGORIES: SlugCategoriesGames[] = MAIN_PAGE_CATEGORIES;

export const FAVORITE_PAGE_CATEGORIES: SlugCategoriesGames[] = MAIN_PAGE_CATEGORIES;

export const PRODUCER_PAGE_CATEGORIES: SlugCategoriesGames[] = POKIES_PAGE_CATEGORIES;

export const CONFIG_DEFAULT_COLLECTIONS_MENU_SLUGS: Record<MenuCollectionsMame, SlugCategoriesGames[]> = {
    MAIN_PAGE_CATEGORIES,
    POKIES_PAGE_CATEGORIES,
    LIVE_PAGE_CATEGORIES,
    CATEGORY_PAGE_CATEGORIES,
    FAVORITE_PAGE_CATEGORIES,
    PRODUCER_PAGE_CATEGORIES,
};
