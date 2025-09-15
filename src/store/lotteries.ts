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

export const useLotteriesStore = defineStore("lotteriesStore", () => {
    const lotteriesList = ref<ILotteriesList>([]);
    const lotteriesStatuses = ref<ILotteriesStatusesList>([]);
    const currentLottery = ref<ILotteriesItem | null>(null);

    const getCommonTicketsBalance = computed<number>(() => {
        return lotteriesStatuses.value.reduce<number>((accumulator: number, item: ILotteriesStatusesItem) => {
            return accumulator + item.tickets.length;
        }, 0);
    });

    const setLotteriesList = (list: ILotteriesList) => {
        lotteriesList.value = list;
    };

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

    function setLotteriesStatuses(list: ILotteriesStatusesList) {
        lotteriesStatuses.value = list;
    }

    function clearLotteriesUserData() {
        lotteriesStatuses.value = [];
    }

    return {
        lotteriesStatuses,
        setLotteriesStatuses,
        currentLottery,

        getCommonTicketsBalance,
        setLotteriesList,
        getLotteriesList,
        getActiveLotteryList,
        getCurrentLottery,

        clearLotteriesUserData,
    };
});
