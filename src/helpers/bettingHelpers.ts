import { routeNames } from "@router/routeNames";
import { storeToRefs } from "pinia";

import { loadBettingConfigReq } from "../services/api/requests/configs";
import { useMultilangStore } from "../store/multilang";
import { getLocale } from "./localeInCookies";

const GEO_MAP_DISABLE_BETTING = {
    EE: true,
};

export const getMirrorForBetting = (): string => {
    const hostname = window.location.hostname;
    const match = hostname.match(/(rocketplay\d*)/);
    return match ? `${match[0]}.com` : "rocketplay.com";
};

export const getMirrorUrl = (): string | null => {
    if (typeof window === "object") {
        return `https://${getMirrorForBetting()}/${getLocale()}`;
    }
    return null;
};

export const getBettingUrl = (): string | null => {
    if (typeof window === "object") {
        return `https://bet.${getMirrorForBetting()}/${getLocale()}`;
    }
    return null;
};

export const showBettingLink = async(): Promise<boolean> => {
    if (typeof window === "undefined") {
        return false;
    }

    const domainsCMS = await loadBettingConfigReq() || [];
    const { getUserGeo } = storeToRefs(useMultilangStore());

    // @ts-expect-error Element implicitly has an 'any'
    return domainsCMS.includes(window.location.hostname) && !GEO_MAP_DISABLE_BETTING[getUserGeo.value];
};

export const bettingLayoutPages = [
    routeNames.bettingReg,
    routeNames.bettingLogin,
    routeNames.bettingMain,
];

// @ts-expect-error Parameter 'route' implicitly has an 'any' type.
export const isBettingLayout = (route): boolean => {
    return bettingLayoutPages.includes(route.name);
};
