import { defineStore, type Pinia } from "pinia";
import { ref } from "vue";

export const useSettings = defineStore("settings", () => {
    const apiUrl = ref<string>("/");
    const websocketUrl = ref<string>("/sock");
    const valdemoroSrc = ref<string>("");
    const isCryptoDomain = ref<boolean>(false);

    return {
        apiUrl,
        websocketUrl,
        valdemoroSrc,
        isCryptoDomain,
    };

});

export function useSettingsFetchService(pinia?: Pinia) {
    useSettings(pinia);

    function initSettingsStore() {
        return Promise.resolve();
    }

    return {
        initSettingsStore,
    };
}
