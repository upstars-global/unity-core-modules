interface ILabel {
    title: string;
}

interface IPrize {
    id: number;
    stuff: string;
    award_place: number;
    nickname: null;
    wager_multiplier: number;
    money_budget_percent: number;
    money_award: number;
    money_award_cents: number;
    chargeable_comp_points_percent: number;
    persistent_comp_points_percent: number;
    persistent_comp_points: number;
    chargeable_comp_points: number;
    freespins_count: number;
}

interface ITopPlayer {
    tournament_id: number;
    nickname: string;
    user_confirmed: null;
    bets: number;
    bet_cents: number;
    wins: number;
    win_cents: number;
    rate: number;
    games_taken: number;
    award_place: number;
    award_place_in_team: null;
    points: number;
    tournament_team_id: null;
}

interface IQuestDataFile {
    title: {
        text: string;
    };
    description: {
        text: string;
        size: string;
    };
    identity: number;
    gradient: {
        colorLeft: string;
        colorLeftCenter: string;
        colorRightCenter: string;
        colorRight: string;
    };
    labels: ILabel[];
    button: {
        name: string;
        url: string;
    };
    secondButton: {
        name: string;
        popup: {
            title: string;
            secondTitle: string;
            desc: string;
        }
    };
}

export interface IUserStatusQuest {
    bets: number;
}

export interface IQuestItem {
    id: number;
    title: string;
    in_progress: boolean;
    user_confirmation_required: boolean;
    frontend_identifier: string;
    strategy: string;
    currencies: string[];
    game_category_identity: string;
    start_at: string;
    end_at: string;
    finished_at: null;
    currency: string;
    money_budget: number;
    money_budget_cents: number;
    group_tournament: boolean;
    winner_team_id: null;
    chargeable_comp_points_budget: number;
    persistent_comp_points_budget: number;
    prizes: IPrize[];
    top_players: ITopPlayer[];
    chargeable_comp_points_prize_pool: number;
    persistent_comp_points_prize_pool: number;
    money_prize_pool: number;
    money_prize_pool_cents: number;
    games_taken_limit: null;
    group_ids: number[];
    questSize: string;
    questSlug: string;
}
export interface IQuestData extends IQuestItem {
    status?: string;
    type?: string;
    image?: string;
    file?: IQuestDataFile;
}
export interface ICurrentUserQuestsStatus {
    tournament_id: number;
    nickname: string;
    user_confirmed: null;
    bets: number;
    bet_cents: number;
    wins: number;
    win_cents: number;
    rate: number;
    games_taken: number;
    award_place: null;
    award_place_in_team: null;
    points: number;
    tournament_team_id: null;
}
