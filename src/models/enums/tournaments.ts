export enum PromoType {
    TOURNAMENT = "tournament",
    LOTTERY = "lottery",
    PRODUCERS = "producers",
    QUEST = "quest",
    ACTION = "action",
    ALL = "all",
}

export enum STATUS_PROMO {
    ARCHIVE = "archive",
    FUTURE = "future",
    ACTIVE = "active",
}

export enum TournamentStrategy {
    SPIN = "spin",
    WIN = "win",
    RATE = "rate",
    POINTS ="points",
    BET = "bet",
}

export const keyForPoints = {
    [TournamentStrategy.SPIN]: "games_taken",
    [TournamentStrategy.WIN]: "wins",
    [TournamentStrategy.RATE]: "rate",
    [TournamentStrategy.POINTS]: "points",
    [TournamentStrategy.BET]: "bets",
};

export default {};
