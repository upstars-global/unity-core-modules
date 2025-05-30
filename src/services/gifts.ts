import {
    STATUSES_GIFT_ISSUED,
    TYPE_GIFT_BONUS,
    TYPE_GIFT_DEPOSIT,
    TYPE_GIFT_FS,
    TYPE_GIFT_REGISTRATION } from "@src/config/gift";

import type { IGift, IGiftDeposit, IGiftFreeSpins } from "../services/api/DTO/gifts";
import { loadDisabledBonusesConfigReq, loadModifyGiftsConfigReq } from "../services/api/requests/configs";
import { useGiftsStore } from "../store/gifts";
import { http } from "./api/http";

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
        const { data } = await http().get("/api/player/bonuses");
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

    giftsStore.setModifyGiftsConfig(data);
}

export async function loadAdditionalDepositGifts(): Promise<void> {
    try {
        const giftsStore = useGiftsStore();
        const { data } = await http().get(
            "/api/fe/config/additional-gifts",
        );

        giftsStore.setAdditionalGifts(data);
    } catch (err) {
        log.error("ERROR_LOAD_ADDITIONAL_GIFT_FILE", err);
        throw err;
    }
}

export async function loadDepositGiftsData(): Promise<void> {
    try {
        const giftsStore = useGiftsStore();
        const { data } = await http().get("/api/bonuses/deposit");
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
        const { data } = await http().get("/api/bonuses/registration");
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
        const { data } = await http().get("/api/player/freespins");
        const prepareFSGiftsData = preparingGiftData<IGiftFreeSpins>(data, TYPE_GIFT_FS);

        giftsStore.setFSGiftsAll(prepareFSGiftsData);
    } catch (err) {
        log.error("LOAD_FS_GIFTS_DATA", err);
        throw err;
    }
}

export async function cancelsFreespins(id: number) {
    try {
        await http().delete(`/api/player/freespins/${ id }`);

        return loadFSGiftsData();
    } catch (err) {
        log.error("CANCELS_FREESPINS", err);
    }
}

export async function activationFreespins(id: number) {
    try {
        return await http().post(`/api/player/freespins/${ id }/activation`);
    } catch (err) {
        log.error("ACTIVATION_FREESPINS", err);
    }
}

export async function cancelsBonus(id: number) {
    try {
        await http().delete(`/api/player/bonuses/${ id }`);

        loadGiftsData();
    } catch (err) {
        log.error("CANCELS_BONUS", err);
    }
}

export async function activationBonus(id: number) {
    try {
        await http().post(`/api/player/bonuses/${ id }/activation`);

        loadGiftsData();
    } catch (err) {
        log.error("ACTIVATION_BONUS", err);
    }
}

