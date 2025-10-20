import {
    LOOTBOX_TYPE_GIFTS,
    STATUSES_LOST_GIFT,
} from "@src/config/gift";
import { defineStore, storeToRefs } from "pinia";
import { computed, ref } from "vue";

import { currencyView } from "../helpers/currencyHelper";
import type { GiftAllItem, IGift, IGiftDeposit, IGiftFreeSpins, IGiftModifyConfig } from "../services/api/DTO/gifts";
import { useUserInfo } from "./user/userInfo";
import { useUserStatuses } from "./user/userStatuses";

export const useGiftsStore = defineStore("giftsStore", () => {
    const userStatuses = useUserStatuses();
    const userInfo = useUserInfo();

    const isLoadingGiftData = ref(false);
    const gifts = ref<IGift[]>([]);
    const disabledBonuses = ref<string[]>([]);
    const modifyGiftsConfig = ref<IGiftModifyConfig[]>([]);
    const additionalGifts = ref({});
    const depositGiftsAll = ref<IGiftDeposit[]>([]);
    const activeDepositGift = ref<IGiftDeposit | null>(null);
    const registrationGiftsAll = ref<IGiftDeposit[]>([]);
    const fsGiftsAll = ref<IGiftFreeSpins[]>([] as IGiftFreeSpins[]);

    const fsGifts = computed<IGiftFreeSpins[]>(() => {
        return fsGiftsAll.value.filter((giftFs) => {
            return ![ "finished", "canceled", "expired" ].includes(giftFs.stage);
        });
    });

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

    const depositGifts = computed<IGiftDeposit[]>(() => {
        const localGifts = depositGiftsAll.value.filter((gift) => {
            return gift.bonuses?.[0]?.type && !LOOTBOX_TYPE_GIFTS.includes(gift.bonuses[0].type);
        });

        if (additionalGift.value) {
            localGifts.push(additionalGift.value);
        }

        return localGifts;
    });

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

    const giftsAll = computed<GiftAllItem[]>(() => {
        const allData = [
            ...depositGifts.value,
            ...fsGifts.value,
            ...giftsActual.value,
            ...registrationGiftsAll.value,
        ];

        modifyGiftsConfig.value.forEach((modifyGift) => {
            allData.forEach((item, index) => {
                if (
                    modifyGift?.group_keys?.includes(String(item.id)) ||
                    modifyGift?.group_keys?.includes(String(item.group_key))
                ) {
                    allData[index].cmsData = modifyGift;
                }
            });
        });

        return allData;
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

    const activeDepositGiftMinDep = computed(() => {
        const { getUserCurrency } = storeToRefs(useUserInfo());
        const { getSubunitsToUnitsByCode } = useUserInfo();

        if (!activeDepositGift.value?.id) {
            return 0;
        }

        const attr = activeDepositGift.value.bonuses[0].conditions.find((item) => {
            return item.field === "amount" && item.type === "min";
        });

        if (attr) {
            const valueAttr = attr.value.find((item) => {
                return item.currency === getUserCurrency.value;
            });

            return currencyView(valueAttr.amount_cents, valueAttr.currency, null, getSubunitsToUnitsByCode(valueAttr.currency));
        }

        return 0;
    });

    function setGiftsLoading(value: boolean): void {
        isLoadingGiftData.value = value;
    }

    function setGifts(value: IGift[]): void {
        gifts.value = value;
    }

    function setDisabledBonuses(value: string[]) {
        disabledBonuses.value = value;
    }

    function setModifyGiftsConfig(value: IGiftModifyConfig[]) {
        modifyGiftsConfig.value = value;
    }

    function setAdditionalGifts(value: Record<string, IGiftDeposit>) {
        additionalGifts.value = value;
    }

    function setDepositGiftsAll(value: IGiftDeposit[]) {
        depositGiftsAll.value = value;
    }

    function setActiveDepositGift(value: IGiftDeposit | null) {
        activeDepositGift.value = value;
    }

    function setRegistrationGiftsAll(value: IGiftDeposit[]) {
        registrationGiftsAll.value = value;
    }

    function setFSGiftsAll(value: IGiftFreeSpins[]) {
        fsGiftsAll.value = value;
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

        setGifts,
        setAdditionalGifts,
        setDepositGiftsAll,
        setActiveDepositGift,
        setRegistrationGiftsAll,
        setFSGiftsAll,

        registrationGiftsAll,
        depositGiftsAll,
        depositGifts,
        activeDepositGift,
        activeDepositGiftMinDep,

        fsGiftsAll,
        fsGifts,

        giftsStoreClear,

        disabledBonuses,
        setDisabledBonuses,

        modifyGiftsConfig,
        setModifyGiftsConfig,

        isLoadingGiftData,
        setGiftsLoading,
    };
});
