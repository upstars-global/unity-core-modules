import type { UnityConfig } from "../../types/configProjectTypes";

export const baseUnityConfig = {
    featureFlags: {
        enableConpoints: true,
        enableAllProviders: false,
        enableMysticJackpots: false,
        enableABReg: false,
    },
} satisfies UnityConfig;
