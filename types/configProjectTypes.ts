import { type Currencies } from "../src/models/enums/currencies";

export type VipAdventuresConfig = {
    groups: Array<string | number>;
    formatDateVipAdv: string;
};

export type UnityConfig = {
    featureFlags: Record<string, boolean>;
    disabledCurrencies: Currencies[];
    referralStag: string | undefined;
    vipAdventures: VipAdventuresConfig;
};
