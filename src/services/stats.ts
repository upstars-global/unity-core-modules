import { getGameImagePath } from "@helpers/gameImage";
import { storeToRefs } from "pinia";

import { useWinners } from "../store/winners";
import { loadWinnersReq } from "./api/requests/stats";

export async function loadWinners(reload = false) {
    const winnersStore = useWinners();
    const { winnersList } = storeToRefs(winnersStore);

    if (!reload && winnersList.value.length > 0) {
        return winnersList.value;
    }

    const data = await loadWinnersReq();

    if (!data) {
        return;
    }

    const mappedWinners = data.map((winner) => {
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

    winnersStore.setWinnersList(mappedWinners);

    return mappedWinners;
}
