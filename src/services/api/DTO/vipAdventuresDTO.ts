import type { Currencies } from "../../../models/enums/currencies";

export interface IPrizeConfigItem {
    title: string;
    prize: {
        freespin?: number
        bonus?: string
    };
    image?: {
        src: string;
        srcRetina: string;
    };
    condition: {
        minDep: string;
        wager: string;
        periodActivationDays: string
    };

}

export interface IVipAdventuresConfig {
    variables: Record<string, Record<string, Record<string, number>>>;
    prizes: Record<string, IPrizeConfigItem[]>;
}

export interface IVipProgress {
    userId: number;
    currency: Currencies;
    currentStatus: string;
    activeStatus: string;
    nextStatus: string;
    depositAmountCents: number;
    depositThresholdCents: number;
    betSumCents: number;
    betSumThresholdCents: number;
    overallProgress: number;
}
