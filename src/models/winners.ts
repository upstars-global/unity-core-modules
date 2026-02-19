enum CURRENCY {
    AUD = "AUD",
    USD = "USD",
}
export interface IWinner {
    currency: CURRENCY;
    game: {
        has_demo_mode: boolean,
        image: string,
        link: string,
        slug: string,
        title: string,
    };
    id: string;
    sum: number;
    user_id: string;
    username: string;
}

export interface IWinnerResponse {
    at: number
    bet_amount_cents: number
    currency: CURRENCY
    game_identifier: string
    game_table_image_path: string
    game_table_url: string
    game_title: string
    humanized_win: string
    nickname: string
    win_amount_cents: number
}
