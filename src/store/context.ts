import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { promiseMemoizer } from "../helpers/promiseHelpers";
import type { IClientContext } from "../models/clientContext";
import { getClientContext } from "../services/api/requests/context";

export const useContextStore = defineStore("context", () => {
    const context = ref<IClientContext>();
    const pending = ref<boolean>(false);

    const getContext = promiseMemoizer(async () => {
        if (!context.value) {
            pending.value = true;
            context.value = await getClientContext();
            pending.value = false;
        }

        return context.value;
    });

    return {
        getContext,
        context,
        pending: computed(() => pending.value),
        isBotUA: computed(() => context.value?.isBot),
    };
});
