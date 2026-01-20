import type { IBannerConfig } from "../models/banners";
import type { IJackpotItem } from "../services/api/DTO/jackpot";
import { useConfigStore } from "../store/configStore";
import { useJackpots } from "../store/jackpots";
import { useUserInfo } from "../store/user/userInfo";
import { currencyView } from "./currencyHelper";

export function jackpotPrizePool(jackpotData: IJackpotItem, subUntilFn: (currency: string) => number): string {
    if (jackpotData) {
        const prizeSumCent = jackpotData.levels.reduce((accum, levelData) => {
            return accum + levelData.amount_cents;
        }, 0);

        return currencyView(
            prizeSumCent,
            jackpotData.currency,
            null,
            subUntilFn(jackpotData.currency),
        );
    }

    return "0";
}

export function prepareJackpotsBanners(bannerConfig: IBannerConfig): IBannerConfig {
    const { $defaultProjectConfig } = useConfigStore();
    const i18n = $defaultProjectConfig.getI18n();
    const { t } = i18n.global;
    const { jackpotsList } = useJackpots();
    const { getSubunitsToUnitsByCode: subUntilFn } = useUserInfo();

    const jackpotOfBanner = jackpotsList.find(({ identifier }) => {
        return identifier === bannerConfig.id;
    });

    if (jackpotOfBanner) {
        const prizeSumCent = jackpotOfBanner.levels.reduce((accum, levelData) => {
            return accum + levelData.amount_cents;
        }, 0);
        const prizeView = currencyView(
            prizeSumCent,
            jackpotOfBanner.currency,
            null,
            subUntilFn(jackpotOfBanner.currency),
        );

        return {
            ...bannerConfig,
            title: {
                text: t(`JACKPOTS.ITEM.${ jackpotOfBanner.identifier }.TITLE`),
            },
            description: {
                text: `Total prize pool ${ prizeView }`,
                size: "medium",
            },
        };
    }

    return bannerConfig;
}
