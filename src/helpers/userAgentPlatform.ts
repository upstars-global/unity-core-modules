import { type IResult, UAParser as uaParser } from "ua-parser-js";
import { isFrozenUA } from "ua-parser-js/helpers";

export interface IPlatformState {
    isMobile: boolean;
    transitionName: string;

    /**
     * @deprecated This property will be removed. use `ua` property from userAgentHints instead
     */
    userAgent?: string;
    userAgentHints?: IResult;
}

// eslint-disable-next-line n/no-unsupported-features/node-builtins
interface INavigator extends Navigator {
    standalone?: boolean;
    userAgentData?: Record<string, unknown>;
}

declare const navigator: INavigator;

const osList = [ "Android", "iOS", "WebOS", "Mobile", "Windows Phone", "Windows Mobile", "Tizen", "BlackBerry" ];
export const getUserAgentPlatform = async (uaHints?: IResult) => {
    const platform: IPlatformState = {
        isMobile: false,
        transitionName: "slide-left",
        userAgentHints: uaHints,
    };

    if (uaHints) {
        const { device, os, ua } = uaHints;
        platform.userAgent = ua;

        if (device.type) {
            platform.isMobile = device.type === "mobile" || device.type === "tablet";
        } else if (os.name) {
            platform.isMobile = osList.includes(os.name);
        }
    } else if (typeof window !== "undefined") {
        const _uaHints = uaParser(navigator.userAgent);
        platform.userAgent = _uaHints.ua;
        platform.userAgentHints = _uaHints;

        if (navigator.userAgentData) {
            if (isFrozenUA(_uaHints.ua)) {
                const userAgentData = await uaParser().withClientHints();
                platform.isMobile = userAgentData.device.is("mobile") || userAgentData.device.is("tablet");
                platform.userAgentHints = userAgentData;
            } else {
                platform.isMobile = _uaHints.device.is("mobile") || _uaHints.device.is("tablet");
            }
        } else if (navigator.standalone === true || window.matchMedia("(display-mode: standalone)").matches) {
            platform.isMobile = true;
        } else {
            platform.isMobile =
                _uaHints.device.is("mobile") ||
                _uaHints.device.is("tablet") ||
                (/Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i).test(navigator.userAgent);
        }
    }

    return platform;
};
