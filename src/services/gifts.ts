import {
    STATUSES_GIFT_ISSUED,
    TYPE_GIFT_BONUS,
    TYPE_GIFT_DEPOSIT,
    TYPE_GIFT_FS,
    TYPE_GIFT_REGISTRATION } from "@src/config/gift";

import { useGiftsStore } from "../store/gifts";
import type { IGift, IGiftDeposit, IGiftFreeSpins } from "./api/DTO/gifts";
import {
    loadAdditionalDepositGiftsConfigReq,
    loadDisabledBonusesConfigReq,
    loadModifyGiftsConfigReq,
} from "./api/requests/configs";
import {
    activateBonusesReq,
    activateFreespinsReq,
    cancelBonusesReq,
    cancelFreespinsReq,
    getDepositBonusesReq,
    getPlayerBonusesReq,
    getPlayerFreespinsReq,
    getRegistrationBonusesReq,
} from "./api/requests/gifts";


function preparingGiftData<T extends IGift | IGiftFreeSpins>(
    giftsCollection: T[],
    type: string,
): Array<T & { type: string }> {
    return giftsCollection.map((giftItem: T) => {
        return {
            ...giftItem,
            type,
        };
    });
}

function preparingGiftOther(giftsCollection: IGiftDeposit[], type: string) {
    return giftsCollection.map((giftItem: IGiftDeposit) => {
        return {
            ...giftItem,
            type,
            title: giftItem.bonuses[0].title,
        };
    });
}

function filterActiveGifts(gifts: IGift[], disabledGifts: string[]) {
    return disabledGifts.length ?
        gifts.filter((gift) => !(disabledGifts.includes(gift.group_key) && gift.stage === STATUSES_GIFT_ISSUED))
        : gifts;
}

export async function loadGiftsData(): Promise<IGift[]> {
    const giftsStore = useGiftsStore();

    if (giftsStore.isLoadingGiftData) {
        return giftsStore.gifts;
    }

    giftsStore.setGiftsLoading(true);

    try {
        const data = await getPlayerBonusesReq();
        const prepareGiftsData = preparingGiftData<IGift>(data, TYPE_GIFT_BONUS);
        const activeGifts = filterActiveGifts(prepareGiftsData, giftsStore.disabledBonuses);

        giftsStore.setGifts(activeGifts);

        return prepareGiftsData;
    } catch (err) {
        giftsStore.setGiftsLoading(false);

        log.error("LOAD_GIFTS_DATA", err);

        throw err;
    } finally {
        giftsStore.setGiftsLoading(false);
    }
}

export async function loadDisabledBonuses(): Promise<void> {
    const giftsStore = useGiftsStore();
    const data = await loadDisabledBonusesConfigReq();

    giftsStore.setDisabledBonuses(data?.group_keys || []);
}

export async function loadModifyGiftsConfig(): Promise<void> {
    const giftsStore = useGiftsStore();
    const data = await loadModifyGiftsConfigReq();

    giftsStore.setModifyGiftsConfig(data || []);
}

export async function loadAdditionalDepositGifts(): Promise<void> {
    try {
        const giftsStore = useGiftsStore();
        const data = await loadAdditionalDepositGiftsConfigReq();

        giftsStore.setAdditionalGifts(data || []);
    } catch (err) {
        log.error("ERROR_LOAD_ADDITIONAL_GIFT_FILE", err);
        throw err;
    }
}

export async function loadDepositGiftsData(): Promise<void> {
    try {
        const giftsStore = useGiftsStore();
        const data = await getDepositBonusesReq();
        const prepareGiftsData = preparingGiftOther(data, TYPE_GIFT_DEPOSIT);

        giftsStore.setDepositGiftsAll(prepareGiftsData);
    } catch (err) {
        log.error("LOAD_DEPOSIT_GIFTS_DATA", err);
        throw err;
    }
}

export async function loadRegistrationGiftsData(): Promise<void> {
    try {
        const giftsStore = useGiftsStore();
        const data = await getRegistrationBonusesReq();
        const prepareRegistrationGifts = preparingGiftOther(data, TYPE_GIFT_REGISTRATION);

        giftsStore.setRegistrationGiftsAll(prepareRegistrationGifts);
    } catch (err) {
        log.error("LOAD_REGISTRATION_GIFTS_DATA", err);
        throw err;
    }
}

export async function loadFSGiftsData(): Promise<void> {
    try {
        const giftsStore = useGiftsStore();
        const data = await getPlayerFreespinsReq();
        const prepareFSGiftsData = preparingGiftData<IGiftFreeSpins>(data, TYPE_GIFT_FS);

        giftsStore.setFSGiftsAll(prepareFSGiftsData);
    } catch (err) {
        log.error("LOAD_FS_GIFTS_DATA", err);
        throw err;
    }
}

export async function cancelsFreespins(id: number) {
    try {
        await cancelFreespinsReq(id);

        return loadFSGiftsData();
    } catch (err) {
        log.error("CANCELS_FREESPINS", err);
    }
}

export function activationFreespins(id: number) {
    try {
        return activateFreespinsReq(id);
    } catch (err) {
        log.error("ACTIVATION_FREESPINS", err);
    }
}

export async function cancelsBonus(id: number) {
    try {
        await cancelBonusesReq(id);

        loadGiftsData();
    } catch (err) {
        log.error("CANCELS_BONUS", err);
    }
}

export async function activationBonus(id: number) {
    try {
        await activateBonusesReq(id);

        loadGiftsData();
    } catch (err) {
        log.error("ACTIVATION_BONUS", err);
    }
}

