import type { UnityConfig } from "../../types/configProjectTypes";

export const baseUnityConfig = {
    featureFlags: {
        enableConpoints: true,
        enableAllProviders: false,
        enableMysticJackpots: false,
        enableABReg: false,
    },
// @ts-expect-error -- TS1360: Type '{ featureFlags: { enableConpoints: true; enableAllProviders: false; enableMysticJackpots: false; enableABReg: false; }; }' does not satisfy the expected type 'UnityConfig'.
} satisfies UnityConfig;
