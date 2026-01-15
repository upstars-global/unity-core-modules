import type { PiniaPluginContext } from "pinia";

export type UnityConfig = {
    ENABLE_CURRENCIES: string[];
    currencyDefault: string;
}

declare module "pinia" {
    export interface PiniaCustomProperties {
        $unityConfig: UnityConfig
    }
}

export const createUnityConfigPlugin = ({ ENABLE_CURRENCIES, currencyDefault }: UnityConfig) => {
    return ({ store, pinia, ...args }: PiniaPluginContext) => {
        pinia.state.$unityConfig = {
            ENABLE_CURRENCIES,
            currencyDefault,
        };
    };
};
