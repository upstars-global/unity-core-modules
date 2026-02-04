import { SlugCategoriesGames } from "@theme/configs/categoryesGames";
import { storeToRefs } from "pinia";
import { UnwrapRef } from "vue";

import { log } from "../controllers/Logger";
import { processGame } from "../helpers/gameHelpers";
import { isExistData } from "../helpers/isExistData";
import { ICollectionItem, IGame, IGamesProvider, IRecentGames } from "../models/game";
import { useConfigStore } from "../store/configStore";
import { useGameCurrent } from "../store/games/gameCurrent";
import { useGamesCategory } from "../store/games/gamesCategory";
import { useGamesFavorite } from "../store/games/gamesFavorite";
import { useGamesProviders } from "../store/games/gamesProviders";
import { useGamesCommon } from "../store/games/gamesStore";
import {
    defaultCollection,
    filterGames,
    filterProviders,
    findGameBySeoTittleAndProducer,
    isLoaded,
} from "../store/games/helpers/games";
import { useJackpots } from "../store/jackpots";
import { useRootStore } from "../store/root";
import { AcceptsGamesVariants, IGameFilter } from "./api/DTO/gamesDTO";
import { loadEnabledGamesConfigReq } from "./api/requests/configs";
import {
    fetchAddFavoriteGamesCount,
    fetchDeleteGameFromFavorites,
    fetchFavoriteGames,
    loadCategoriesFileConfigRequest,
    loadFilteredGames as loadFilteredGamesReq,
    loadGameBySeoTitleReq,
    loadGameBySlugReq,
    loadGamesCategories as loadGamesCategoriesReq,
    loadGamesCategory as loadGamesCategoryReq,
    loadGamesDataByFilter,
    loadGamesJackpots as loadGamesJackpotsReq,
    loadGamesProvidersReq,
    loadLastGames as loadLastGamesReq,
} from "./api/requests/games";

export function getMenuCategoriesBySlug(slug: string): SlugCategoriesGames[] {
    const jackpotsStore = useJackpots();
    const gamesStore = useGamesCommon();

    return (
        gamesStore.menuGameCategories[slug] ||
    gamesStore.defaultMenuGameCategories[slug]
    ).filter((menuSlug: string) =>
        (menuSlug === SlugCategoriesGames.SLUG_CATEGORY_MYSTIC_JACKPOTS ? jackpotsStore.isTurnOnJPMystic : true));
}

export async function loadCategoriesFileConfig() {
    const gamesStore = useGamesCommon();

    if (Object.keys(gamesStore.menuGameCategories).length > 0) {
        return gamesStore.menuGameCategories;
    }

    const data = await loadCategoriesFileConfigRequest();

    if (data) {
        gamesStore.setMenuGameCategories(data);
    }
}

export async function loadEnableGamesConfig() {
    const gamesStore = useGamesCommon();
    const data = await loadEnabledGamesConfigReq();

    if (data) {
        gamesStore.setEnableGamesConfig(data);
    }
}

export async function loadGamesJackpots(): Promise<void> {
    try {
        const gamesStore = useGamesCommon();
        const jackpots = await loadGamesJackpotsReq();

        gamesStore.setGamesJackpots(jackpots);
    } catch (error) {
        log.error("Error loading games jackpots", error);
    }
}

export async function loadLastGames(): Promise<void> {
    try {
        const lastGamesList = await loadLastGamesReq();

        if (!lastGamesList.length) {
            return;
        }

        const gamesMap: IRecentGames = {};
        const game_ids: string[] = [];

        lastGamesList.forEach((game) => {
            gamesMap[game.identifier] = game;
            game_ids.push(game.identifier);
        });

        const { isMobile } = storeToRefs(useRootStore());

        const requestConfig = {
            game_ids,
            device: isMobile.value ? "mobile" : "desktop",
        };

        const recentGamesResponse = await loadFilteredGamesReq(requestConfig);
        const recentGames: IRecentGames = {};

        for (const gameIdentifier in recentGamesResponse) {
            if (recentGamesResponse[gameIdentifier]) {
                recentGames[gameIdentifier] = {
                    ...(gamesMap[gameIdentifier] || {}),
                    ...recentGamesResponse[gameIdentifier],
                };
            }
        }

        const gamesStore = useGamesCommon();

        gamesStore.setRecentGames(recentGames);

        log.info("RECENT_GAMES_LOADED", recentGames);
    } catch (error) {
        log.error("LOAD_LAST_GAMES", error);
    }
}

export async function loadGamesCategories(): Promise<void> {
    try {
        const gamesStore = useGamesCommon();
        const { gamesCategories } = storeToRefs(gamesStore);

        if (isExistData(gamesCategories.value)) {
            return;
        }

        const data = await loadGamesCategoriesReq();

        const gamesCategoriesMap = data.map((category) => {
            return {
                ...category,
                provider: category.id,
                slug: category.id,
                url: `/games/${category.id}`,
                name: category.title,
            };
        });

        gamesStore.setGamesCategories(gamesCategoriesMap);
    } catch (error) {
        log.error("LOAD_GAMES_CATEGORIES", error);
    }
}

export async function loadData({ slug, page = 1 }: { slug: string, page?: number }): Promise<UnwrapRef<ICollectionItem>> {
    const gamesProvidersStore = useGamesProviders();
    const { collections } = storeToRefs(gamesProvidersStore);
    const isLoadedData = isLoaded(collections.value[slug] as ICollectionItem, page);
    const { isMobile } = storeToRefs(useRootStore());
    const { gamesPageLimit } = storeToRefs(useConfigStore());

    if (isLoadedData) {
        return collections.value[slug];
    }

    try {
        const data = await loadGamesDataByFilter<ICollectionItem>({
            device: isMobile.value ? "mobile" : "desktop",
            filter: {
                providers: [ slug ],
            },
            page,
            page_size: gamesPageLimit.value,
        });

        gamesProvidersStore.setData(data, slug);

        return data;
    } catch (err) {
        log.error("LOAD_GAMES_CATEGORY_ERROR", err);
        throw err;
    }
}

export function initCollection(data: IGamesProvider[]) {
    if (!data) {
        return;
    }

    const gamesProvidersStore = useGamesProviders();
    const { collections } = storeToRefs(gamesProvidersStore);
    const combineCollections: Record<string, ICollectionItem> = {};

    data.forEach((item) => {
        if (collections.value[item.slug]) {
            return;
        }

        combineCollections[item.slug] = defaultCollection();
    });

    gamesProvidersStore.setCollections({
        ...combineCollections,
        ...collections.value,
    });
}

export async function loadGamesProviders(): Promise<IGamesProvider[]> {
    try {
        const gamesProvidersStore = useGamesProviders();
        const providers = await loadGamesProvidersReq();

        let data = providers.map((provider: IGamesProvider) => {
            return {
                ...provider,
                provider: provider.id,
                slug: provider.id,
                url: `/producers/${ provider.id }`,
                name: provider.title,
            };
        });

        data = filterProviders(data);

        gamesProvidersStore.setAllProviders(data);
        initCollection(data);

        return data;
    } catch (err) {
        log.error("LOAD_GAMES_PROVIDERS_ERROR", err);
        throw err;
    }
}

export async function loadFavoriteGames() {
    try {
        const gamesFavoriteStore = useGamesFavorite();
        const [
            gamesFullData,
            gamesID,
        ] = await Promise.all([
            fetchFavoriteGames(AcceptsGamesVariants.fullData),
            fetchFavoriteGames(AcceptsGamesVariants.onlyID),
        ]);

        const processedGames = gamesFullData
            .map((game) => processGame(game, game.identifier));
        const filteredGames = filterGames(processedGames);

        gamesFavoriteStore.setFavoritesId(gamesID);
        gamesFavoriteStore.setGamesFavoriteFullData(filteredGames);
    } catch (err) {
        log.error("LOAD_FAVORITE_GAMES_ERROR", err);
        throw err;
    }
}

export async function addGameToFavorites(idGame: number): Promise<void> {
    await fetchAddFavoriteGamesCount(idGame);
    await loadFavoriteGames();
}

export async function deleteGameFromFavorites(idGame: number) {
    await fetchDeleteGameFromFavorites(idGame);

    const gamesFavoriteStore = useGamesFavorite();
    const { favoritesId, gamesFavoriteFullData } = storeToRefs(gamesFavoriteStore);

    const filteredFavoritesId = favoritesId.value.filter((idFavorite) => idFavorite !== idGame);
    const filteredGamesFavoriteFullData = gamesFavoriteFullData.value.filter((gameFavorite) => {
        return !Object.values(gameFavorite.currencies).some(({ id }) => id === idGame);
    });

    gamesFavoriteStore.setFavoritesId(filteredFavoritesId);
    gamesFavoriteStore.setGamesFavoriteFullData(filteredGamesFavoriteFullData);
}

export async function loadGameBySeoTitle(seoTitle: string, producer: string, restrict: boolean = false): Promise<IGame> {
    const { setGameToCache, getGameFromCache } = useGamesCommon();
    const { setToCurrentGame } = useGameCurrent();
    const gameFromCache = getGameFromCache({ seoTitle, producer });

    if (gameFromCache) {
        return setToCurrentGame(gameFromCache);
    }

    try {
        const data = await loadGameBySeoTitleReq(seoTitle, restrict);
        const dataToArray = Object.values(data);
        const gameData = findGameBySeoTittleAndProducer(dataToArray, { seoTitle, producer }) || dataToArray[0];

        setGameToCache(gameData);
        return setToCurrentGame(gameData);
    } catch (err) {
        log.error("LOAD_GAME_BY_SEO_TITLE", err);
        throw err;
    }
}

export async function loadGameBySlug(slug: string) {
    const { setGameToCache, getGameFromCache } = useGamesCommon();
    const { setToCurrentGame } = useGameCurrent();
    const gameInCache = getGameFromCache({ identifier: slug });

    if (gameInCache) {
        return setToCurrentGame(gameInCache);
    }

    try {
        const data = await loadGameBySlugReq(slug);
        const gameData = Object.values(data)[0];

        if (gameData) {
            setGameToCache(gameData);

            return setToCurrentGame(gameData);
        }
    } catch (err) {
        log.error("LOAD_GAME_BY_SLUG", err);
        throw err;
    }
}

export async function loadGamesCategory(slug: string, page: number = 1): Promise<ICollectionItem | undefined> {
    const gamesCategoryStore = useGamesCategory();
    const { collections } = storeToRefs(gamesCategoryStore);
    const { gamesPageLimit } = storeToRefs(useConfigStore());
    const slugCollection = gamesCategoryStore.categoryGeo(slug);
    const loaded = gamesCategoryStore.isLoaded(slugCollection, page);

    if (loaded) {
        return collections.value[slugCollection];
    }

    try {
        const { isMobile } = storeToRefs(useRootStore());

        const device = isMobile.value ? "mobile" : "desktop";

        const reqConfig: IGameFilter = {
            device,
            filter: {
                categories: {
                    identifiers: [ slugCollection ],
                    strategy: "OR",
                },
            },
            page,
            page_size: gamesPageLimit.value,
        };

        const data = await loadGamesCategoryReq(reqConfig);

        gamesCategoryStore.setData(data, slugCollection);
    } catch (err) {
        log.error("LOAD_GAMES_CATEGORY_ERROR", err);
    }
}
