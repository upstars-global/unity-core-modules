import type { OddsType } from "../../../models/common";
import type { Currencies } from "../../../models/enums/currencies";

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

type ProviderStatus = "active" | "inactive";

interface AdditionalProvider {
    enabled: boolean;
    provider: string;
}

export interface BettingPlayerSettingsDTO {
    provider_statuses: Record<string, ProviderStatus>;
    video_settings?: {
        enabled: boolean;
        providers: string[];
    };
    stakes: {
        [K in keyof typeof Currencies]: number[];
    };
    custom_bet_allow_single: boolean;
    custom_bet_enabled: boolean;
    auto_accept_odds_change?: string;
    odds_types: {
        available: OddsType[];
        selected: OddsType;
    };
    sport_type_providers: {
        regular: string;
        cyber: string;
    };
    updated_at: string;
    multi_bet_settings: {
        available_by_provider: Record<string, boolean>;
    };
    additional_providers: {
        horse_racing: AdditionalProvider;
        lotto: AdditionalProvider;
    };
    allow_multiple_active_user_freebets: boolean;
}

export default {};
