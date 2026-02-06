import type { PiniaPluginContext } from "pinia";

import { type UnityConfig } from "../../types/configProjectTypes";


declare module "pinia" {
    export interface DefineStoreOptionsBase<S, Store> {
        projectConfiguration?: boolean
    }

    export interface PiniaCustomProperties {
        $defaultProjectConfig: UnityConfig
    }
}


export const createUnityConfigPlugin = (configProject: UnityConfig) => {
    return ({ store, options }: PiniaPluginContext) => {
        if (!options.projectConfiguration) {
            return;
        }

        store.$defaultProjectConfig = configProject;
    };
};
