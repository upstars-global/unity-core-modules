export type BonusType =
    | "comboboost"
    | "freebet_no_risk"
    | "freebet_all_win"
    | "freebet_only_win"
    | "hunting"
    | "tournament"
    | "lootbox"
    | "jackpot";

export type BonusStatus = "active" | "inactive";

export type BonusComputedStatus =
    | "available"
    | "active"
    | "not_available"
    | "deactivated"
    | "over"
    | "expired"
    | "overridden"
    | "unknown";

export type TriggerKey = "once" | "has_group" | "registration" | "deposit" | "birthday" | "code" | "bets";

export type SportType = "regular" | "cyber" | "premium_cricket";

export type FreebetType = "no_risk" | "only_win" | "all_win";

export interface INamedEntityRef {
    id: number;
    name: string;
}

export interface IBonusBannerMedia {
    id: number;
    url: string;
    name: string;
}

export interface IBonusBanners {
    mobile?: IBonusBannerMedia;
    desktop?: IBonusBannerMedia;
    specific_banners?: Record<string, { mobile?: IBonusBannerMedia; desktop?: IBonusBannerMedia }>;
}

export interface IEventCondition {
    sport?: INamedEntityRef | null;
    category?: INamedEntityRef | null;
    tournament?: INamedEntityRef | null;
    event?: INamedEntityRef | null;
    sport_type?: SportType | null;
}

export interface IComboboostRange {
    min_count: number;
    max_count: number;
    bonus_odds: number;
}

export interface IComboboostIssued {
    times_used: number;
    used_in_bets: string[];
    created_at: string | null;
    valid_from: string;
    activated_at: string | null;
    expired_at: string | null;
    seen: boolean;
    computed_status: BonusComputedStatus;
}

export interface IComboboostDetails {
    id: string;
    issued?: IComboboostIssued;
    ranges?: IComboboostRange[];
    event_conditions?: IEventCondition[];
    uses_count?: number;
    min_odds?: number;
    country_codes?: string[];
    valid_to?: string | null;
    banners?: IBonusBanners;
}

export interface IFreebetIssued {
    times_used: number;
    currency: string;
    amount: number;
    is_active: boolean;
    used_in_bets: string[];
    activated_at: string | null;
    expired_at: string | null;
    created_at: string;
    boost_multiplier: number | null;
    boost_required: boolean;
    seen: boolean;
    computed_status: BonusComputedStatus;
    valid_from: string | null;
}

export interface IFreebetDetails {
    id: string;
    issued?: IFreebetIssued;
    status: BonusStatus;
    name: string;
    type: FreebetType;
    min_odds: number;
    max_odds: number | null;
    selection_count_from: number;
    selection_count_to: number | null;
    match_status: "live" | "not_started" | null;
    event_conditions?: IEventCondition[];
    uses_count?: number | null;
    country_codes?: string[] | null;
    boost_data?: number[] | null;
    banners?: IBonusBanners;
    computed_status?: BonusComputedStatus;
    valid_from?: string | null;
}

export interface IHuntingFarmingStats {
    avg_stake: number;
    bets_count: number;
    points: number;
    available_points: number;
    potential_points: number;
    potential_freebet_amount: number;
}

export interface IHuntingIssued {
    farmed_event_ids?: string[] | null;
    currency: string;
    currency_subunits: number;
    is_active: boolean;
    used_in_bets: string[];
    farming_stats?: IHuntingFarmingStats | null;
    activated_at?: string | null;
    expired_at?: string | null;
    seen?: boolean;
    computed_status: BonusComputedStatus;
    valid_from: string;
}

export interface IHuntingDetails {
    id: string;
    status: BonusStatus;
    name: string;
    farm_once_per_event: boolean;
    farming_freebet_type: FreebetType;
    show_in_promotion: boolean;
    event_conditions?: IEventCondition[];
    country_codes?: string[];
    valid_to?: string | null;
    min_odds?: number | null;
    banners?: IBonusBanners;
    issued?: IHuntingIssued;
}

export interface ILootboxDetails extends IHuntingDetails {
    issued?: IHuntingIssued;
    freebets_to_boost?: IFreebetDetails[];
    progress_bar?: number;
}

export interface ITournamentStats extends IHuntingFarmingStats {
    initial_pool: number;
}

export interface IHuntingTournamentIssued extends IHuntingIssued {
    farming_stats?: ITournamentStats | null;
}

export interface IHuntingTournamentDetails extends IHuntingDetails {
    issued_hunting_tournament?: IHuntingTournamentIssued;
}

export type BonusDetails =
    | IComboboostDetails
    | IFreebetDetails
    | IHuntingDetails
    | ILootboxDetails
    | IHuntingTournamentDetails
    | null;

export interface IBettingBonus {
    type: BonusType;
    details: BonusDetails;
    status?: BonusStatus;
    only_verified?: boolean;
    trigger_key?: TriggerKey;
    name?: string;
    ranges?: IComboboostRange[];
    event_conditions?: IEventCondition[];
    uses_count?: number | null;
    min_odds?: number;
    country_codes?: string[] | null;
    valid_to?: string | null;
    banners?: IBonusBanners;
}
