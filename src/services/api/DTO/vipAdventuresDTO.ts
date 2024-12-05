import { Currencies } from "./cashbox";

export interface IPrizeConfigItem {
    title: string;
    prize: {
        freespin?: number
        bonus?: string
    };
    condition: {
        minDep: string;
        wager: string;
        periodActivationDays: string
    };

}

export interface IVipAdventuresConfig {
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
