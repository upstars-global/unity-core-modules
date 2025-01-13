import { STATUS_PROMO } from "../models/enums/tournaments";

export const getCssGradient = (gradient) => {
    const {
        colorLeft,
        colorLeftCenter,
        colorRightCenter,
        colorRight,
    } = gradient || {};

    const extendedGradient = {
        background: `linear-gradient(
                    270deg,
                    ${colorLeft} 0%,
                    ${colorLeft} calc(50% - 1500px),
                    ${colorLeftCenter} calc(50% - 750px),
                    ${colorRightCenter} calc(50% + 750px),
                    ${colorRight} calc(50% + 1500px),
                    ${colorRight} 100%
              )`.replace(/\n/g, ""),
    };

    const shortGradient = {
        background: `linear-gradient(to right, ${colorRight}, ${colorLeft})`,
    };

    return {
        extendedGradient,
        shortGradient,
    };
};

export const TYPE_ACTION_BUTTON = {
    TOURNAMENTS: "tournaments",
    LOTTERY: "lottery",
};

export function getActionsByStatus(list = [], frontId: string) {
    return [ ...list ].sort(({ status }) => {
        switch (status) {
            case STATUS_PROMO.ACTIVE:
                return -1;
            case STATUS_PROMO.FUTURE:
                return 0;
            case STATUS_PROMO.ARCHIVE:
                return 1;

            default:
                return 0;
        }
    }).find(({ frontend_identifier: actionFrontId }) => {
        return actionFrontId === frontId;
    });
}

export function isSameHost(url: string) {
    try {
        const host = new URL(url);
        return host.hostname === location.hostname;
    } catch (e) {
        return true;
    }
}
