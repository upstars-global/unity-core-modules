import { Currencies } from "src/models/enums/currencies";

export type UnityConfig = {
    featureFlags: Record<string, boolean>;
    disabledCurrencies: Currencies[];
};
