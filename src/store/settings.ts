import { defineStore } from "pinia ";
import { ref } from "vue";

export const useSettings = defineStore("settings", () => {
    const apiUrl = ref<string>("/");
    const websocketUrl = ref<string>("/sock");
    const valdemoroSrc = ref<string>("");
    const isCryptoDomain = ref<boolean>(false);
    const sentryDsn = ref<string>("");

    return {
        apiUrl,
        websocketUrl,
        valdemoroSrc,
        isCryptoDomain,
        sentryDsn,
    };
});
