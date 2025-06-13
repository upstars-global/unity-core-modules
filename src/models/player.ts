import type { OddsType } from "./common";

export interface BettingPlayerSettings {
    oddsTypes: OddsType[];
    selectedOddsType: OddsType;
}
