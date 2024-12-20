import i18nInit from "@i18n";

import type { IBannerConfig } from "../models/banners";
import { useJackpots } from "../store/jackpots";
import { useUserInfo } from "../store/user/userInfo";
import { currencyView } from "./currencyHelper";

export function prepareJackpotsBanners(bannerConfig: IBannerConfig): IBannerConfig {
    const i18n = i18nInit.instance || i18nInit.init();
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
