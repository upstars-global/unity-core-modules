import type { Pinia } from "pinia";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { promoFilterAndSettings } from "../helpers/promoHelpers";
import { PromoType } from "../models/enums/tournaments";
import type {
    ILotteriesItem,
    ILotteriesList,
    ILotteriesStatusesItem,
    ILotteriesStatusesList,
} from "../services/api/DTO/lotteriesDTO";
import {
    getLotteryByIDReq,
    getLotteryStatusByIDReq,
    loadLotteriesListReq,
    loadLotteriesStatusesReq,
} from "../services/api/requests/lotteries";

export const useLotteriesStore = defineStore("lotteriesStore", () => {
    const lotteriesList = ref<ILotteriesList>([]);
    const lotteriesStatuses = ref<ILotteriesStatusesList>([]);
    const currentLottery = ref<ILotteriesItem | null>(null);

    const getCommonTicketsBalance = computed<number>(() => {
        return lotteriesStatuses.value.reduce<number>((accumulator: number, item: ILotteriesStatusesItem) => {
            return accumulator + item.tickets.length;
        }, 0);
    });

    const getLotteriesList = computed<ILotteriesList | []>(() => {
        return promoFilterAndSettings<ILotteriesItem>(lotteriesList.value, PromoType.LOTTERY);
    });

    const getActiveLotteryList = computed<ILotteriesList>(() => {
        return getLotteriesList.value.filter(({ in_progress: inProgress }) => {
            return inProgress;
        });
    });

    const getCurrentLottery = computed<ILotteriesItem | null>(() => {
        if (currentLottery.value) {
            return promoFilterAndSettings<ILotteriesItem>([ currentLottery.value ], PromoType.LOTTERY)?.[0] ||
                null;
        }
        return null;
    });

    async function loadLotteriesList(): Promise<ILotteriesList> {
        const lotteriesResponse = await loadLotteriesListReq();
        lotteriesList.value = lotteriesResponse;
        return lotteriesResponse;
    }

    async function loadLotteryStatuses(): Promise<ILotteriesStatusesList> {
        const resp = await loadLotteriesStatusesReq();
        lotteriesStatuses.value = resp;

        return resp;
    }

    async function loadLotteryByID(id: number): Promise<ILotteriesItem> {
        if (currentLottery.value?.id === id) {
            return Promise.resolve(currentLottery.value);
        }

        currentLottery.value = null;
        const resp = await getLotteryByIDReq(id);
        currentLottery.value = resp;
        return resp;
    }

    async function loadLotteryStatusByID(id: number): Promise<void> {
        const resp = await getLotteryStatusByIDReq(id);

        lotteriesStatuses.value = [
            ...lotteriesStatuses.value.filter(({ lottery_id }) => lottery_id !== resp.lottery_id),
            resp,
        ];
    }

    function clearLotteriesUserData() {
        lotteriesStatuses.value = [];
    }

    return {
        lotteriesStatuses,

        getCommonTicketsBalance,
        getLotteriesList,
        getActiveLotteryList,
        getCurrentLottery,

        loadLotteriesList,
        loadLotteryStatuses,
        loadLotteryByID,
        loadLotteryStatusByID,
        clearLotteriesUserData,
    };
});

export function useLotteriesFetchService(pinia?: Pinia) {
    const lotteriesStore = useLotteriesStore(pinia);

    function loadLotteriesList() {
        return lotteriesStore.loadLotteriesList();
    }

    return {
        loadLotteriesList,
    };
}
