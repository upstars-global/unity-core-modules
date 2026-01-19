import type { PiniaPluginContext } from "pinia";

export type UnityConfig = {
    ENABLE_CURRENCIES: string[];
    currencyDefault: string;
}


declare module "pinia" {
    export interface DefineStoreOptionsBase<S, Store> {
        projectConfiguration?: boolean
    }

    export interface PiniaCustomProperties {
        $defaultProjectConfig: UnityConfig
    }
}


export const createUnityConfigPlugin = ({
    ENABLE_CURRENCIES,
    currencyDefault,
}: UnityConfig) => {
    return ({ store, options }: PiniaPluginContext) => {
        if (!options.projectConfiguration) {
            return;
        }

        store.$defaultProjectConfig = {
            ENABLE_CURRENCIES,
            currencyDefault,
        };
    };
};
