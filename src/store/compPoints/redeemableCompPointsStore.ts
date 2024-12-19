import { defineStore, StoreDefinition, storeToRefs } from "pinia";
import { computed, ref } from "vue";

import { CompPointRatesTypes, CompPointsTypes } from "../../models/enums/compPoints";
import { GameMode } from "../../models/enums/gamesConsts";
import type { IRedeemableCards } from "../../services/api/DTO/compPoints";
import { exchangeCompPointRateBySlug, loadCompPointRateBySlug } from "../../services/api/requests/compPoints";
import { loadFilteredGames } from "../../services/api/requests/games";
import { useUserInfo } from "../user/userInfo";
import { useLotteriesStore } from "../lotteries";
import { useStatusCompPointsStore } from "./statusCompPointsStore";

export interface ICompPointsStoreConfig {
    routeNames: Record<string, string>,
    useCMS: StoreDefinition
}

function checkHasAvailableCards(list: IRedeemableCards[], isLogged: boolean, balance: number, currency: string) {
    if (!isLogged || !balance || !list) {
        return false;
    }

    return list.some((card) => {
        const points = card.type === CompPointRatesTypes.MONEY ?
            card.rates.find((item) => item.currency === currency).points :
            card.rate.points;

        return balance >= points;
    });
}
export function createRedeemableCompPointsStore(config: ICompPointsStoreConfig) {
    const { routeNames, useCMS } = config;
    return defineStore("redeemableCompPointsStore", () => {
        const { getIsLogged, getUserCurrency } = storeToRefs(useUserInfo());
        const rates = ref<Record<string, unknown>>({});
        const { currentStaticPage } = storeToRefs(useCMS());
        const { getChargeableBalance } = storeToRefs(useStatusCompPointsStore());
        const { loadUserCompPoints } = useStatusCompPointsStore();
        const { loadLotteryStatuses } = useLotteriesStore();
        const pageSlug: string = "rocket-mart";

        const getTabsAvailable = computed(() => {
            const types = Object.keys(CompPointsTypes);

            return types.reduce((obj, key) => {
                obj[key] =
                    checkHasAvailableCards(
                        getRates.value[key],
                        getIsLogged.value,
                        getChargeableBalance.value,
                        getUserCurrency.value,
                    );
                return obj;
            }, {} as Record<string, boolean>);
        });
        const getViewImages = computed(() => {
            if (!currentStaticPage.value?.meta.json) {
                return {};
            }

            return currentStaticPage.value.meta.json.viewImages || {};
        });
        const getPromos = computed(() => {
            if (!currentStaticPage.value?.meta.json || !currentStaticPage.value.slug === pageSlug) {
                return;
            }

            return currentStaticPage.value.meta.json.promo || null;
        });
        const getGameTitles = computed(() => {
            if (!currentStaticPage.value?.meta.json || !currentStaticPage.value.slug === pageSlug) {
                return;
            }

            return currentStaticPage.value.meta.json.gamesTitles || {};
        });
        const getMaxWin = computed(() => {
            if (!currentStaticPage.value?.meta.json || !currentStaticPage.value.slug === pageSlug) {
                return "";
            }

            return currentStaticPage.value.meta.json.maxWin ?
                `${currentStaticPage.value.meta.json.maxWin[getUserCurrency.value]} ${getUserCurrency.value}` :
                "";
        });
        const getFreeSpinsWager = computed(() => {
            if (!currentStaticPage.value?.meta.json || !currentStaticPage.value.slug === pageSlug) {
                return {};
            }

            return currentStaticPage.value.meta.json.freeSpinsWager || {};
        });
        const getMockCards = computed(() => {
            if (!currentStaticPage.value?.meta.json || !currentStaticPage.value.slug === pageSlug) {
                return;
            }

            return currentStaticPage.value.meta.json.cards || null;
        });
        const getRates = computed(() => (getIsLogged.value ? rates.value : getMockCards.value));

        async function loadRates() {
            const [ money, lootBoxes, freeSpins, lotteries ] =
                (await Promise.all(Object.values(CompPointRatesTypes).map((key) => loadCompPointRateBySlug(key))));

            rates.value = {
                MONEY_REWARD: money,
                FREE_SPINS: freeSpins.length ? freeSpins : getMockCards.value.FREE_SPINS,
                SPECIAL_REWARDS: [ ...lootBoxes, ...lotteries ],
            };
        }

        async function exchangeBySlug(payload, slug: CompPointRatesTypes) {
            await exchangeCompPointRateBySlug(
                slug,
                {
                    exchange: {
                        ...payload,
                        currency: getUserCurrency.value,
                    },
                },
            );
            if (slug === CompPointRatesTypes.LOTTERIES) {
                await loadLotteryStatuses();
            } else {
                await loadUserCompPoints();
            }
        }

        async function getGameInfo(gameIds: string[]) {
            const [ game ] = Object.values(await loadFilteredGames({ game_ids: gameIds }));

            if (!game) {
                return null;
            }
            return {
                name: routeNames.gameItem,
                params: {
                    name: game?.seo_title || "",
                    producer: game?.provider || "",
                },
                query: { mode: getIsLogged.value ? GameMode.Real : GameMode.Demo },
            };
        }

        return {
            rates,
            getRates,
            getTabsAvailable,
            getViewImages,
            getPromos,
            getGameTitles,
            getMaxWin,
            getFreeSpinsWager,
            exchangeBySlug,
            loadRates,
            getGameInfo,
        };
    });
}
