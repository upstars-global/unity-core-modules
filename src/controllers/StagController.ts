import { DEFAULT_STAGS_COUNTRY_REFER, REFERRER, STAG_PARTNER_KEY } from "@theme/configs/stagConsts";
import { storeToRefs } from "pinia";

import { referrerHelper } from "../helpers/referrerHelper";
import { isServer } from "../helpers/ssrHelpers";
import type { IStagByReferName } from "../models/configs";
import { useCommon } from "../store/common";
import { useMultilangStore } from "../store/multilang";
import { CookieController } from "./CookieController";
import log from "./Logger";

interface IGetStagParams {
    referrer?: string;
    stagsByReferName: IStagByReferName;
    path: string;
    country: string;
}

interface IStagInfo {
    stagId: string;
    stagVisit: string;
}

function getStagByReferrerName({ referrer, stagsByReferName, path, country } = {} as IGetStagParams): string {
    if (referrer) {
        const referSearchEnginesMatch = Object.values(REFERRER).find((refItem) => referrer.includes(refItem));

        if (!referSearchEnginesMatch) {
            return "";
        }

        const localStagByReferName = stagsByReferName || {
            pages: null,
            countries: DEFAULT_STAGS_COUNTRY_REFER,
        };

        const stagReferPathValue = localStagByReferName?.pages?.[referSearchEnginesMatch]?.[path];
        const stagReferGeoValue = localStagByReferName?.countries?.[country]?.[referSearchEnginesMatch];
        const stagReferOthersGeoValue = localStagByReferName?.countries?.others?.[referSearchEnginesMatch];

        return stagReferPathValue || stagReferGeoValue || stagReferOthersGeoValue || "";
    }

    return "";
}

function setStag(stag: string): void {
    try {
        CookieController.set(STAG_PARTNER_KEY, stag, { expires: 30 * 86400, path: "/" });
    } catch (error) {
        log.error("STAG_ERROR_SET_COOKIE", error);
    }
}

function getStag(): string | undefined {
    return CookieController.get(STAG_PARTNER_KEY);
}

function getStagInfo(): IStagInfo | null {
    const stag = getStag();

    if (stag) {
        const [ stagId, stagVisit ] = stag.split("_");
        return { stagId, stagVisit };
    }

    return null;
}

function sendLogUserEmptyStag(referrer: string): void {
    log.error("STAG_ERROR_EMPTY", `Referrer: ${referrer}`);
}

async function init(): Promise<void> {
    if (isServer) {
        return;
    }

    if (getStag()) {
        return;
    }

    const referrer = referrerHelper();

    const url = new URL(window.location.href);
    const path = url.pathname;

    const queryParams = new URLSearchParams(url.search);
    const stagQuery = queryParams.get("stag");

    if (stagQuery) {
        setStag(stagQuery);
    } else {
        const { getUserGeo } = storeToRefs(useMultilangStore());
        const loadStagByReferName = await useCommon().loadStagByReferName();

        const stagReferrer = getStagByReferrerName({
            referrer,
            path,
            stagsByReferName: loadStagByReferName!,
            country: getUserGeo.value,
        });

        if (stagReferrer) {
            setStag(stagReferrer);
        }
    }

    if (referrer && !getStag()) {
        sendLogUserEmptyStag(referrer);
    }
}

export default {
    init,
    getStag,
    getStagInfo,
    getStagByReferrerName,
};
