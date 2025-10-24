export enum GiftState {
    issued = "issued",
    wait = "wait",
    handle_bets = "handle_bets",
    lost = "lost",
    canceled = "canceled",
    expired = "expired",
    wager_done = "wager_done"
}

export interface IGiftModifyConfig {
    group_keys: string[],
    logo: string,
    url: string
}

export interface IGift {
    id: number;
    title: string;
    amount_cents: number;
    currency: string;
    stage: GiftState;
    strategy: string;
    amount_wager_requirement_cents: number;
    amount_wager_cents: number;
    created_at: string;
    activatable_until: string | null;
    valid_until: string;
    activatable: boolean;
    cancelable: boolean;
    type: string;
    group_key?: string;
    cmsData?: IGiftModifyConfig
}

export interface IGiftDeposit {
    id: string;
    title: string;
    bonuses: [
        {
            title: string;
            type: string;
            conditions: [
                {
                    field: string;
                    type: string;
                    value: [
                        {
                            currency: string;
                            amount_cents: number;
                        }
                    ];
                }
            ];
            attributes: [];
            result_bonus: [];
        }
    ];
    group_key?: string;
    cmsData?: IGiftModifyConfig
}

export interface IGiftFreeSpins {
    id: number;
    title: string;
    freespins_total: number;
    freespins_performed: null;
    bet_level: number;
    stage: GiftState;
    games: string[];
    games_info: [];
    activation_path: string;
    provider: string;
    currency: string;
    created_at: string;
    activatable_until: string;
    valid_until: null;
    activatable: boolean;
    activation_condition: null;
    cancelable: boolean;
    group_key: boolean | string;
    type: string;
    cmsData?: IGiftModifyConfig
}

export type GiftAllItem = IGift | IGiftDeposit | IGiftFreeSpins;
export default {};
