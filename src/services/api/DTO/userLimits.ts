export interface ILimitAccount {
    "currency": string;
    "amount_cents": number;
    "current_value_amount_cents": number;
    "active_until": string;
}

export interface IUserLimit {
    "period": string;
    "status": string;
    "disable_at": string | null;
    "confirm_until": string | null;
    "parent_type": string | null;
    "strategy": string | null;
    "created_at": string | null;
    "id": number;
    "type": string;
    "accounts": ILimitAccount[];
}
