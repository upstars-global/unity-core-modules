import { useStatusCompPointsStore } from "src/store/compPoints/statusCompPointsStore";

import { CompPointRatesTypes } from "../models/enums/compPoints";
import { GameMode } from "../models/enums/gamesConsts";
import { useRedeemableCompPointsStore } from "../store/compPoints/redeemableCompPointsStore";
import { useUserInfo } from "../store/user/userInfo";
import { IExchange } from "./api/DTO/compPoints";
import {
    exchangeCompPointRateBySlug,
    exchangeToMoneyReq,
    loadCompPointRateBySlug,
    loadRatesMoneyReq,
    loadUserCompPointsReq,
} from "./api/requests/compPoints";
import { loadFilteredGames } from "./api/requests/games";
import { loadLotteryStatuses } from "./lotteries";

export async function exchangeBySlug(payload: Record<string, unknown>, slug: CompPointRatesTypes) {
    const userInfoStore = useUserInfo();

    await exchangeCompPointRateBySlug(
        slug,
        {
            exchange: {
                ...payload,
                currency: userInfoStore.getUserCurrency,
            },
        },
    );
    if (slug === CompPointRatesTypes.LOTTERIES) {
        await loadLotteryStatuses();
    } else {
        await loadUserCompPoints();
    }
}

export async function loadRates() {
    const redeemableCompPointsStore = useRedeemableCompPointsStore();

    const [ money, lootBoxes, freeSpins, lotteries ] =
            (await Promise.all(Object.values(CompPointRatesTypes).map((key) => loadCompPointRateBySlug(key))));

    redeemableCompPointsStore.setRates({
        MONEY_REWARD: money,
        FREE_SPINS: freeSpins.length ? freeSpins : redeemableCompPointsStore.getMockCards?.FREE_SPINS || [],
        SPECIAL_REWARDS: [ ...lootBoxes, ...lotteries ],
    });
}

export async function getGameInfo(gameIds: string[], routeName: string) {
    const userInfoStore = useUserInfo();

    const [ game ] = Object.values(await loadFilteredGames({ game_ids: gameIds }));

    if (!game) {
        return null;
    }

    return {
        name: routeName,
        params: {
            name: game.seo_title || "",
            producer: game.provider || "",
        },
        query: { mode: userInfoStore.getIsLogged ? GameMode.Real : GameMode.Demo },
    };
}

export async function loadUserCompPoints() {
    const { updateCompPoints } = useStatusCompPointsStore();

    const data = await loadUserCompPointsReq();

    if (!data) {
        return;
    }

    updateCompPoints(data);
}

export async function exchangeToMoney({ points, group, currency }: IExchange) {
    await exchangeToMoneyReq({ points, group, currency });
    await loadUserCompPoints();
}

export async function loadRatesMoney() {
    const ratesResponse = await loadRatesMoneyReq();
    const { setRatesMoney } = useStatusCompPointsStore();

    if (!ratesResponse) {
        return;
    }

    setRatesMoney(ratesResponse);
}
