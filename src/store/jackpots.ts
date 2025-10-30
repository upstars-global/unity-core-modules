import { defineStore, type Pinia } from "pinia";
import { computed, ref } from "vue";

import type { IJackpotItem } from "../services/api/DTO/jackpot";
import { loadJackpotsList } from "../services/api/requests/jackpots";

export const useJackpots = defineStore("jackpots", () => {
    const jackpotsList = ref<IJackpotItem[]>([]);
    const jackpotsActiveList = computed<IJackpotItem[]>(() => {
        return jackpotsList.value.filter((jackpotItem: IJackpotItem) => {
            return jackpotItem.state === "active";
        });
    });

    async function loadJackpots(): Promise<IJackpotItem[] | void> {
        const data = await loadJackpotsList();
        jackpotsList.value = data;

        return data;
    }

    function updateJackpotItemInList({ data: jackpotItem }: {
        data: IJackpotItem
    }): void {
        const indexJackpotInList = jackpotsList.value.findIndex((item: IJackpotItem) => {
            return item.id === jackpotItem.id;
        });
        try {
            jackpotsList.value.splice(indexJackpotInList, 1, jackpotItem);
        } catch (error) {
            console.log(error);
        }
    }

    return {
        jackpotsList,
        jackpotsActiveList,
        loadJackpots,
        updateJackpotItemInList,
    };
});

export function useJackpotsFetchService(pinia?: Pinia) {
    const jackpotsStore = useJackpots(pinia);

    function loadJackpots() {
        return jackpotsStore.loadJackpots();
    }

    return {
        loadJackpots,
    };
}
