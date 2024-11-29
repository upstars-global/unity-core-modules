import type {Currencies} from "../../../models/enums/currencies";

export interface IUserAccountCompatibility {
    currency: Currencies;
    amount_cents: number;
    available_to_cashout_cents: number;
    wager_status: string;
}

export interface IUserAccount extends Omit<IUserAccountCompatibility, "wager_status"> {
    available_to_bet_with_locked_cent: number;
    hidden_at: string | null;
    deposit_available: boolean;
    selected_lottery_id: number;
    active: boolean;
}

export enum UserAccountLicense {
    CW = "CW",
    EE = "EE"
}

interface ICent {
    user: string;
    timestamp: string;
    token: string;
    authEndpoint: string;
    url: string;
}
export interface IUserSettings {
    cent: ICent;
    recaptcha: string;
    recaptcha_version: number;
}
export interface ISubscriptions {
    receive_promos: boolean;
    receive_sms_promos: boolean;
    receive_promos_via_phone_calls: boolean;
    agreed_to_partner_promotions: boolean;
}

interface IMessages {
    notice: string;
}

interface IDepositsSum {
    BTC: number;
    EUR: number;
    USD: number;
}
export interface IPlayerStats {
    deposits_count: number;
    deposits_sum: IDepositsSum;
    cashouts_sum: IDepositsSum;
    bets_sum: IDepositsSum;
    messages: IMessages;
}
