import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { log } from "../controllers/Logger";
import type { IJackpotItem } from "../services/api/DTO/jackpot";

export const useJackpots = defineStore("jackpots", () => {
    const jackpotsList = ref<IJackpotItem[]>([]);

    const jackpotsActiveList = computed<IJackpotItem[]>(() => {
        return jackpotsList.value.filter((jackpotItem: IJackpotItem) => {
            return jackpotItem.state === "active";
        });
    });

    function updateJackpotItemInList({ data: jackpotItem }: {
        data: IJackpotItem
    }): void {
        const indexJackpotInList = jackpotsList.value.findIndex((item: IJackpotItem) => {
            return item.id === jackpotItem.id;
        });
        try {
            jackpotsList.value.splice(indexJackpotInList, 1, jackpotItem);
        } catch (error) {
            log.error("UPDATE_JACKPOT_ITEM_IN_LIST_ERROR", error);
        }
    }

    function setJackpotsList(data: IJackpotItem[]): void {
        jackpotsList.value = data;
    }

    return {
        jackpotsList,
        jackpotsActiveList,
        updateJackpotItemInList,
        setJackpotsList,
    };
});
