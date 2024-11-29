import type {Currencies} from "../../../models/enums/currencies";

export type ITournamentsList = ITournament[];
export type IPlayersList = IPlayer[];
export interface IPlayerConfirmation {
    confirmed: boolean;
}
export interface ITournament {
    id: number;
    title: string;
    in_progress: boolean;
    user_confirmation_required: boolean;
    frontend_identifier: string;
    strategy: string;
    currencies: Currencies;
    game_category_identity: string;
    start_at: string;
    end_at: string;
    finished_at: string | null;
    currency: string;
    money_budget: string;
    money_budget_cents: number;
    chargeable_comp_points_budget: number;
    persistent_comp_points_budget: number;
    winner_team_id: number;
    group_tournament: boolean;
    prizes: IPrize[];
    top_players: IPlayer[];
    chargeable_comp_points_prize_pool: number;
    persistent_comp_points_prize_pool: number;
    money_prize_pool: string;
    money_prize_pool_cents: number;
    games_taken_limit: number;
    group_ids: number[];
}

interface IPrize {
    id: number;
    stuff: string;
    award_place: number;
    nickname: string;
    wager_multiplier: number;
    money_budget_percent: number;
    money_award: string;
    money_award_cents: number;
    chargeable_comp_points_percent: number;
    persistent_comp_points_percent: number;
    persistent_comp_points: number;
    chargeable_comp_points: number;
    player_notified: boolean;
    contest_type: string;
    contest_id: number;
    freespins_count: number;
}

export interface IPlayer {
    tournament_id: number;
    tournament_team_id: number;
    nickname: string;
    user_confirmed: boolean;
    bets: string;
    bet_cents: number;
    wins: string;
    win_cents: number;
    rate: number;
    games_taken: number;
    award_place: number;
    award_place_in_team: number;
    points: number;
}
