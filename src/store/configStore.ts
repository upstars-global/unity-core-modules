import { defineStore } from "pinia";
import { ref } from "vue";


export const useConfigStore = defineStore("configStore", () => {
    const gamesPageLimit = ref<number>(40);

    function setGamesPageLimit(limit: number) {
        gamesPageLimit.value = limit;
    }

    return {
        gamesPageLimit,
        setGamesPageLimit,
    };
});
