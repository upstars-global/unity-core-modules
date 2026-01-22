import { defineStore } from "pinia";
import { ref } from "vue";

import { http } from "../services/api/http";
import { useConfigStore } from "./configStore";

enum CURRENCY {
    AUD = "AUD",
    USD = "USD",
}

interface IWinner {
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

interface IWinnerResponse {
    data: Array<{
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
    }>;
}

export const useWinners = defineStore("winners", () => {
    const { $defaultProjectConfig } = useConfigStore();
    const { getGameImagePath } = $defaultProjectConfig;
    const winnersList = ref<IWinner[]>([]);

    async function loadWinners(reload = false) {
        if (!reload && winnersList.value.length > 0) {
            return winnersList.value;
        }

        const data: IWinnerResponse = await http().get("/api/stats/winners/latest");

        winnersList.value = data.data.map((winner) => {
            const [ , slug ] = winner.game_identifier.split("/");
            return {
                game: {
                    has_demo_mode: false,
                    image: getGameImagePath(winner.game_identifier),
                    link: `play/${ slug }`,
                    slug,
                    title: winner.game_title,
                },
                id: winner.game_identifier,
                sum: winner.win_amount_cents,
                currency: winner.currency,
                user_id: winner.nickname,
                username: winner.nickname,
            };
        });

        return winnersList.value;
    }

    return {
        loadWinners,
    };
});
