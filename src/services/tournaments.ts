import { storeToRefs } from "pinia";

import { isQuest } from "../helpers/questHelpers";
import { useQuestStore } from "../store/quest/questStore";
import { useUserInfo } from "../store/user/userInfo";
import { type ITournamentsList } from "./api/DTO/tournamentsDTO";
import { loadQuestDataReq } from "./api/requests/tournaments";

export async function loadQuestsData(tournamentsList: ITournamentsList) {
    const { getIsLogged } = storeToRefs(useUserInfo());
    const { setQuestsList, setNewStatusesUserQuest } = useQuestStore();

    const filteredQuestsList = tournamentsList.filter((tournament) => isQuest(tournament.frontend_identifier));

    setQuestsList(filteredQuestsList);

    if (getIsLogged.value) {
        const statuses = await loadQuestDataReq(filteredQuestsList) || [];

        setNewStatusesUserQuest(statuses);
    }
}
