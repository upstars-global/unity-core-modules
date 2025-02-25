import type { IResult } from "ua-parser-js";

export function isAndroidUserAgent(uaHints: IResult): boolean {
    if (!uaHints) {
        return false;
    }

    if (uaHints.os) {
        return uaHints.os.name === "Android";
    }

    return (/Android/i).test(uaHints.ua);
}

export function isIOSUserAgent(uaHints: IResult): boolean {
    if (!uaHints) {
        return false;
    }

    if (uaHints.os) {
        return uaHints.os.name === "iOS";
    }

    if (uaHints.device?.model) {
        return [ "iPad", "iPhone", "iPod" ].includes(uaHints.device.model);
    }

    return (/iPhone|iPad|iPod/i).test(uaHints.ua);
}

export function getBrowserName(uaHints: IResult) {
    return uaHints.browser?.name;
}

