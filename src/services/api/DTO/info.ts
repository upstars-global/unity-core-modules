import { Currencies } from "./cashbox";
import { UserAccountLicense } from "./playerDTO";

export interface ICountries {
    name: string;
    code: string;
    default_currency: Currencies;
}

export interface ICurrencies {
    code: Currencies;
    symbol: string;
    subunits_to_unit: number;
    fiat: boolean;
    default: boolean;
    subcurrencies: unknown[];
}

export interface IProjectInfo {
    apps: {
        sportsbook: boolean;
        casino: boolean;
    };
    sns_config: {
        enable: boolean;
        "base_url": string;
        "flow": string;
    };
    license: UserAccountLicense;
    player_two_factor_auth: boolean;
    available_currency_exchange: boolean;
    available_referral_system: boolean;
    supported_payment_api_versions: string[];
    hooyu_integration: boolean;
    country_flags: null;
    livespins: {
        enabled: boolean;
    };
    authentication_key: string;
}

export type ICryptoExchangeRates = Record<Currencies, Record<Currencies, {
    exchange_rate: number;
    fee: number;
    total_exchange_rate: number;
}>>;
