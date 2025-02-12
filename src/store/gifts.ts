import {
    LOOTBOX_TYPE_GIFTS,
    STATUSES_GIFT_ISSUED,
    STATUSES_LOST_GIFT,
    TYPE_GIFT_BONUS,
    TYPE_GIFT_DEPOSIT,
    TYPE_GIFT_FS,
    TYPE_GIFT_REGISTRATION } from "@src/config/gift";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { log } from "../controllers/Logger";
import type { GiftAllItem, IGift, IGiftDeposit, IGiftFreeSpins, IGiftModifyConfig } from "../services/api/DTO/gifts";
import { http } from "../services/api/http";
import { loadDisabledBonusesConfigReq, loadModifyGiftsConfigReq } from "../services/api/requests/configs";
import { useUserInfo } from "./user/userInfo";
import { useUserStatuses } from "./user/userStatuses";

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
export const useGiftsStore = defineStore("giftsStore", () => {
    const userStatuses = useUserStatuses();
    const userInfo = useUserInfo();

    const gifts = ref<IGift[]>([]);
    const disabledBonuses = ref<string[]>([]);
    const modifyGiftsConfig = ref<IGiftModifyConfig[]>([]);
    const giftsActual = computed<IGift[]>(() => {
        return gifts.value.filter((gift: IGift) => {
            return !STATUSES_LOST_GIFT.includes(gift.stage);
        });
    });

    const giftsLost = computed<IGift[]>(() => {
        return gifts.value.filter((gift: IGift) => {
            return STATUSES_LOST_GIFT.includes(gift.stage);
        });
    });

    let isLoadingGiftData = false;

    async function loadGiftsData(): Promise<IGift[]> {
        if (isLoadingGiftData) {
            return gifts.value;
        }

        isLoadingGiftData = true;
        try {
            const { data } = await http().get("/api/player/bonuses");
            const prepareGiftsData = preparingGiftData<IGift>(data, TYPE_GIFT_BONUS);
            gifts.value = filterActiveGifts(prepareGiftsData, disabledBonuses.value);

            return prepareGiftsData;
        } catch (err) {
            isLoadingGiftData = false;
            log.error("LOAD_GIFTS_DATA", err);
            throw err;
        } finally {
            isLoadingGiftData = false;
        }
    }

    async function loadDisabledBonuses(): Promise<void> {
        const data = await loadDisabledBonusesConfigReq();
        disabledBonuses.value = data?.group_keys || [];
    }

    async function loadModifyGiftsConfig(): Promise<void> {
        const data = await loadModifyGiftsConfigReq();
        modifyGiftsConfig.value = data?.[0]?.group_keys ? data : [];
    }

    const depositGiftsAll = ref<IGiftDeposit[]>([]);
    const depositGifts = computed<IGiftDeposit[]>(() => {
        const localGifts = depositGiftsAll.value.filter((gift) => {
            return gift.bonuses?.[0]?.type && !LOOTBOX_TYPE_GIFTS.includes(gift.bonuses[0].type);
        });

        if (additionalGift.value) {
            localGifts.push(additionalGift.value);
        }

        return localGifts;
    });

    const additionalGifts = ref({});
    // @ts-expect-error No overload matches this call.
    const additionalGift = computed<IGiftDeposit | void>(() => {
        if (
            !userInfo.getUserInfo.can_issue_bonuses ||
            userInfo.getUserInfo.deposit_bonus_code ||
            userStatuses.isMultiAccount
        ) {
            return;
        }


        const [ , gift ] = Object.entries(additionalGifts.value).find(([ key ]) => {
            return userStatuses.getUserGroups.includes(Number(key));
        }) || [];

        return gift;
    });

    async function loadAdditionalDepositGifts(): Promise<unknown> {
        try {
            const { data } = await http().get(
                "/api/fe/config/additional-gifts",
            );
            additionalGifts.value = data;

            return additionalGifts.value;
        } catch (err) {
            log.error("ERROR_LOAD_ADDITIONAL_GIFT_FILE", err);
            throw err;
        }
    }

    async function loadDepositGiftsData(): Promise<IGiftDeposit[]> {
        try {
            const { data } = await http().get("/api/bonuses/deposit");
            const prepareGiftsData = preparingGiftOther(data, TYPE_GIFT_DEPOSIT);
            depositGiftsAll.value = prepareGiftsData;

            return prepareGiftsData;
        } catch (err) {
            log.error("LOAD_DEPOSIT_GIFTS_DATA", err);
            throw err;
        }
    }

    const registrationGiftsAll = ref<IGiftDeposit[]>([]);

    async function loadRegistrationGiftsData(): Promise<IGiftDeposit[]> {
        try {
            const { data } = await http().get("/api/bonuses/registration");
            const prepareRegistrationGifts = preparingGiftOther(data, TYPE_GIFT_REGISTRATION);
            registrationGiftsAll.value = prepareRegistrationGifts;

            return prepareRegistrationGifts;
        } catch (err) {
            log.error("LOAD_REGISTRATION_GIFTS_DATA", err);
            throw err;
        }
    }

    const fsGiftsAll = ref<IGiftFreeSpins[]>([] as IGiftFreeSpins[]);
    const fsGifts = computed<IGiftFreeSpins[]>(() => {
        return fsGiftsAll.value.filter((giftFs) => {
            return ![ "finished", "canceled", "expired" ].includes(giftFs.stage);
        });
    });

    async function loadFSGiftsData(): Promise<IGiftFreeSpins[]> {
        try {
            const { data } = await http().get("/api/player/freespins");
            const prepareFSGiftsData = preparingGiftData<IGiftFreeSpins>(data, TYPE_GIFT_FS);
            fsGiftsAll.value = prepareFSGiftsData;

            return prepareFSGiftsData;
        } catch (err) {
            log.error("LOAD_FS_GIFTS_DATA", err);
            throw err;
        }
    }

    const giftsAll = computed<GiftAllItem[]>(() => {
        return [
            ...depositGifts.value,
            ...fsGifts.value,
            ...giftsActual.value,
            ...registrationGiftsAll.value,
        ];
    });

    const giftsNew = computed<GiftAllItem[]>(() => {
        return giftsAll.value.filter((gift) => {
            return "activatable" in gift && gift.activatable_until && gift.activatable || !("amount_wager_cents" in gift);
        });
    });

    const giftsActive = computed<GiftAllItem[]>(() => {
        return giftsAll.value
            .filter((gift) => {
                return !giftsNew.value.some((giftNew) => {
                    return giftNew.id === gift.id;
                });
            });
    });

    const giftsCounter = computed<number>(() => {
        return giftsAll.value.length;
    });

    async function cancelsFreespins(id: number) {
        try {
            await http().delete(`/api/player/freespins/${ id }`);
            return await loadFSGiftsData();
        } catch (err) {
            log.error("CANCELS_FREESPINS", err);
        }
    }

    async function activationFreespins(id: number) {
        try {
            return await http().post(`/api/player/freespins/${ id }/activation`);
        } catch (err) {
            log.error("ACTIVATION_FREESPINS", err);
        }
    }

    async function cancelsBonus(id: number) {
        try {
            await http().delete(`/api/player/bonuses/${ id }`);
            loadGiftsData();
            return Promise.resolve();
        } catch (err) {
            log.error("CANCELS_BONUS", err);
        }
    }

    async function activationBonus(id: number) {
        try {
            await http().post(`/api/player/bonuses/${ id }/activation`);
            loadGiftsData();
            return Promise.resolve();
        } catch (err) {
            log.error("ACTIVATION_BONUS", err);
        }
    }

    function giftsStoreClear(): void {
        gifts.value = [];
        depositGiftsAll.value = [];
        registrationGiftsAll.value = [];
        fsGiftsAll.value = [];
    }

    return {
        giftsAll,
        giftsCounter,

        gifts,
        giftsActual,
        giftsLost,
        giftsNew,
        giftsActive,
        loadGiftsData,

        depositGiftsAll,
        depositGifts,
        loadDepositGiftsData,
        loadAdditionalDepositGifts,

        loadRegistrationGiftsData,

        fsGiftsAll,
        fsGifts,
        loadFSGiftsData,

        giftsStoreClear,

        cancelsFreespins,
        activationFreespins,
        cancelsBonus,
        activationBonus,
        loadDisabledBonuses,
        loadModifyGiftsConfig,
    };
});
