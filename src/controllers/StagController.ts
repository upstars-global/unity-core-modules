import {
    AFFB_ID_COOKIE,
    AFFB_ID_DEFAULT,
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


function getStagByReferrerName({ referrer, stagsByReferName, path, country } = {} as IGetStagParams): string {
    if (referrer) {
        const referSearchEnginesMatch = Object.values(REFERRER).find((refItem) => referrer.includes(refItem));

        if (!referSearchEnginesMatch) {
            return "";
        }
        const localStagsByReferName = stagsByReferName || {
            pages: null,
            countries: DEFAULT_STAGS_COUNTRY_REFER,
        };

        const stagReferPathValue = localStagsByReferName?.pages?.[referSearchEnginesMatch]?.[path];
        const stagReferGeoValue = localStagsByReferName?.countries?.[country]?.[referSearchEnginesMatch];
        const stagReferOthersGeoValue = localStagsByReferName?.countries?.others?.[referSearchEnginesMatch];

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

async function initStag(queryParams: URLSearchParams, path: string): Promise<void> {
    if (getStag()) {
        return;
    }

    const referrer = referrerHelper();
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

function initAffbId(queryParams: URLSearchParams): void {
    if (getAffbId()) {
        return;
    }

    const affbIdQuery = queryParams.get("affb_id");
    setAffbId(affbIdQuery || AFFB_ID_DEFAULT);
}


function init(): void {
    if (isServer) {
        return;
    }

    const url = new URL(window.location.href);
    const path = url.pathname;
    const queryParams = new URLSearchParams(url.search);

    initAffbId(queryParams);
    initStag(queryParams, path);
}

export const StagController = {
    init,
    getAffbId,
    getStag,
    getStagInfo,
    getStagByReferrerName,
};
