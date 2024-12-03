export interface IVipAdventuresDayConfig {
    day: string;
    step: number;
    stepTotal: number;
    isCompleted: boolean;
    title: string;
    condition: {
        minDep: string;
        wager: string;
        periodActivationDays: string;
    };
    prize: {
        freespin?: number;
        bonus?: string;
    };
}
