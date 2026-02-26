import { defineStore } from "pinia";
import { computed, ref } from "vue";

const PRODUCTION_ENV = "production";

export const useEnvironments = defineStore("environments", () => {
    const version = ref<string>("");
    const useMocker = ref<boolean>(false);
    const baseUrl = ref<string>("/");
    const environment = ref<string>("production");
    const hostMetaPrefix = ref<string>("");

    const getEnvironments = computed(() => {
        return {
            version: version.value,
            useMocker: useMocker.value,
            baseUrl: baseUrl.value,
            environment: environment.value,
            hostMetaPrefix: hostMetaPrefix.value,
        };
    });

    const isProduction = computed<boolean>(() => {
        return environment.value === PRODUCTION_ENV;
    });

    return {
        getEnvironments,
        baseUrl,
        useMocker,
        environment,
        version,
        isProduction,
    };
});

