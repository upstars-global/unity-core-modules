import { computed, ref } from "vue";
import { defineStore } from "pinia";

import { http } from "../services/api/http";
import log from "../controllers/Logger";
import type { IJackpotWinner } from "../models/winner";

export const useJackpotWinners = defineStore("winnersJackpot", () => {
    const winnersData = ref<IJackpotWinner[]>([]);
    const biggestWinnersData = ref<IJackpotWinner[]>([]);

    async function getJackpotWinners() {
        try {
            const { data } = await http().get("/api/jackpot_wins");
            winnersData.value = data;
        } catch (err) {
            log.error("GET_JACKPOT_WINNERS_ERROR", err);
        }
    }

    const sortBiggestWinnersList = computed(() => {
        biggestWinnersData.value = winnersData.value.slice();
        return biggestWinnersData.value.sort((a, b) => b.amount_cents - a.amount_cents);
    });

    const sortLatestWinnersList = computed(() => {
        return winnersData.value;
    });

    return {
        getJackpotWinners,
        sortBiggestWinnersList,
        sortLatestWinnersList,
    };
});
