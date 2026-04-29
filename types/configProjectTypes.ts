import { type Currencies } from "../src/models/enums/currencies";
import type { UserGroup } from "../src/models/user";

export type UnityConfig = {
    featureFlags: Record<string, boolean>;
    disabledCurrencies: Currencies[];
    referralStag: string | undefined;
    vipAdventuresGroups?: UserGroup[];
};
