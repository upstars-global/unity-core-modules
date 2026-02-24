import { defineStore } from "pinia";
import { computed, ref } from "vue";

import type { IJackpotWinner } from "../models/winner";

export const useJackpotWinners = defineStore("winnersJackpot", () => {
    const winnersData = ref<IJackpotWinner[]>([]);
    const biggestWinnersData = ref<IJackpotWinner[]>([]);

    const sortBiggestWinnersList = computed(() => {
        biggestWinnersData.value = winnersData.value.slice();
        return biggestWinnersData.value.sort((a, b) => b.amount_cents - a.amount_cents);
    });

    const sortLatestWinnersList = computed(() => {
        return winnersData.value;
    });

    function setWinnersData(data: IJackpotWinner[]) {
        winnersData.value = data;
    }

    return {
        sortBiggestWinnersList,
        sortLatestWinnersList,
        setWinnersData,
    };
});
