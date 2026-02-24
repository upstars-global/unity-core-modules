
import { defineStore } from "pinia";
import { ref } from "vue";

import { IWinner } from "../models/winners";

export const useWinners = defineStore("winners", () => {
    const winnersList = ref<IWinner[]>([]);

    function setWinnersList(data: IWinner[]) {
        winnersList.value = data;
    }

    return {
        winnersList,
        setWinnersList,
    };
});
