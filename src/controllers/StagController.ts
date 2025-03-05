import {
    AFFB_ID_COOKIE,
    AFFB_ID_DEFAULT,
    AFFB_ID_NEW_PARTNERS,
    DEFAULT_STAGS_COUNTRY_REFER,
    REFERRER,
    STAG_PARTNER_COOKIE,
} from "@theme/configs/stagConsts";
import { storeToRefs } from "pinia";

import { referrerHelper } from "../helpers/referrerHelper";
import { isServer } from "../helpers/ssrHelpers";
import type { IStagByReferName } from "../models/configs";
import { useCommon } from "../store/common";
import { useMultilangStore } from "../store/multilang";
import { CookieController } from "./CookieController";
import { log } from "./Logger";

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

const expires = 30 * 86400; // 30 days


function getReferSearchEnginesMatch(referrer: string): string {
    return Object.values(REFERRER).find((refItem) => referrer.includes(refItem as string)) || "";
}

function getStagByReferrerName({ referrer, stagsByReferName, path, country } = {} as IGetStagParams): string {
    if (referrer) {
        const searchEngine = getReferSearchEnginesMatch(referrer as string);

        if (!searchEngine) {
            return "";
        }

        const localStagsByReferName = DEFAULT_STAGS_COUNTRY_REFER ? stagsByReferName || {
            pages: null,
            countries: DEFAULT_STAGS_COUNTRY_REFER,
        } : stagsByReferName;

        const stagReferPathValue = localStagsByReferName?.pages?.[searchEngine]?.[path];
        const stagReferGeoValue = localStagsByReferName?.countries?.[country]?.[searchEngine];
        const stagReferOthersGeoValue = localStagsByReferName?.countries?.others?.[searchEngine];

        return stagReferPathValue || stagReferGeoValue || stagReferOthersGeoValue || "";
    }

    return "";
}

function setStag(stag: string): void {
    try {
        CookieController.set(STAG_PARTNER_COOKIE, stag, { expires, path: "/" });
    } catch (error) {
        log.error("STAG_ERROR_SET_COOKIE", error);
    }
}

function getStag(): string | undefined {
    return CookieController.get(STAG_PARTNER_COOKIE);
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

async function initStag(queryParams: URLSearchParams, path: string, referrer: string): Promise<void> {
    if (getStag()) {
        return;
    }

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


function setAffbId(affb_id: string): void {
    try {
        CookieController.set(AFFB_ID_COOKIE, affb_id, { expires, path: "/" });
    } catch (error) {
        log.error("AFFB_ID_ERROR_SET_COOKIE", error);
    }
}

function getAffbId(): string | undefined {
    return CookieController.get(AFFB_ID_COOKIE);
}

function initAffbId(queryParams: URLSearchParams, referrer: string): void {
    if (getAffbId()) {
        return;
    }

    const affbIdQuery = queryParams.get("affb_id");

    if (affbIdQuery) {
        setAffbId(affbIdQuery);
    } else {
        const searchEngine = getReferSearchEnginesMatch(referrer as string);
        const computedAffbId = searchEngine ? AFFB_ID_NEW_PARTNERS : AFFB_ID_DEFAULT;

        setAffbId(computedAffbId);
    }
}


function init(): void {
    if (isServer) {
        return;
    }

    const referrer = referrerHelper() || "";
    const url = new URL(window.location.href);
    const path = url.pathname;
    const queryParams = new URLSearchParams(url.search);

    if (AFFB_ID_COOKIE) {
        initAffbId(queryParams, referrer);
    }

    initStag(queryParams, path, referrer);
}

export const StagController = {
    init,
    getAffbId,
    getStag,
    getStagInfo,
    getStagByReferrerName,
};
