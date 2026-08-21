import { storeToRefs } from "pinia";

import { isExistData } from "../helpers/isExistData";
import { isQuest } from "../helpers/questHelpers";
import { sanitizeUserTourStatuses } from "../helpers/tournaments";
import { useQuestStore } from "../store/quest/questStore";
import { useTournamentsStore } from "../store/tournaments/tournamentsStore";
import { useUserInfo } from "../store/user/userInfo";
import { IPlayersList, ITournament, type ITournamentsList } from "./api/DTO/tournamentsDTO";
import {
    chooseTournamentReq,
    loadBatchTournamentStatusesReq,
    loadQuestDataReq,
    loadRecentTournamentsReq,
    loadTournamentByIdReq,
    loadTournamentsListReq,
    loadUserTournamentsReq,
} from "./api/requests/tournaments";

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

export async function loadTournaments() {
    const tournamentsStore = useTournamentsStore();
    const { tournamentsList } = storeToRefs(tournamentsStore);

    if (isExistData(tournamentsList.value)) {
        return tournamentsList.value;
    }

    const tournamentsResponse = await loadTournamentsListReq();
    const filteredTournaments = tournamentsResponse
        .filter(({ frontend_identifier }) => frontend_identifier !== "nonvisible");

    tournamentsStore.setTournamentsList(filteredTournaments);
}

export async function loadTournamentBySlug(slug: number): Promise<Partial<ITournament> | null> {
    const tournamentsStore = useTournamentsStore();
    const { currentTournament } = storeToRefs(tournamentsStore);

    if (currentTournament.value?.id === slug) {
        return currentTournament.value;
    }

    tournamentsStore.setCurrentTournament({});

    if (Number(slug)) {
        const tournament = await loadTournamentByIdReq(slug) ?? {};

        tournamentsStore.setCurrentTournament(tournament);
    }

    return currentTournament.value;
}

export async function loadCurrentUserTourStatusesBatch(): Promise<void> {
    try {
        const tournamentsStore = useTournamentsStore();
        const { currentUserTournamentsStatuses, getAllTournamentsOnlyUser } = storeToRefs(tournamentsStore);

        const hasUserTourStatuses = Boolean(currentUserTournamentsStatuses.value.length);
        const tournamentIds = getAllTournamentsOnlyUser.value.map((tourItem: ITournament) => tourItem.id);

        if (tournamentIds.length === 0) {
            return;
        }

        const statusesMap = await loadBatchTournamentStatusesReq(tournamentIds);
        const statuses = tournamentIds.map((id) => statusesMap[id]).filter(Boolean);

        const newStatuses = hasUserTourStatuses ?
            sanitizeUserTourStatuses(currentUserTournamentsStatuses.value, statuses) :
            statuses;

        tournamentsStore.setCurrentUserTournamentsStatuses(newStatuses);
    } catch (error) {
        console.error('Error loading batch tournament statuses:', error);
    }
}

export async function loadUserTournaments(): Promise<void> {
    const tournamentsStore = useTournamentsStore();
    const { currentUserTournamentsStatuses, getAllTournamentsOnlyUser } = storeToRefs(tournamentsStore);
    const tournaments = await loadUserTournamentsReq();

    tournamentsStore.setUserTournaments(tournaments);

    // Check if we already have statuses for all user tournaments
    const tournamentIds = getAllTournamentsOnlyUser.value.map((tourItem: ITournament) => tourItem.id);
    const existingStatusIds = currentUserTournamentsStatuses.value.map((status) => status.tournament_id);
    const missingStatuses = tournamentIds.filter((id) => !existingStatusIds.includes(id));

    if (missingStatuses.length > 0) {
        await loadCurrentUserTourStatusesBatch();
    }
}

export async function chooseTournament(id: number): Promise<void> {
    await chooseTournamentReq(id);
    await loadUserTournaments();
}

export async function loadRecentTournaments(): Promise<void> {
    const tournamentsStore = useTournamentsStore();
    const recentTournaments = await loadRecentTournamentsReq();

    tournamentsStore.setRecentTournaments(recentTournaments);
}

export async function updateUserTourStatuses(data: IPlayersList): Promise<void> {
    const tournamentsStore = useTournamentsStore();
    const { currentUserTournamentsStatuses, userTournaments } = storeToRefs(tournamentsStore);

    tournamentsStore.setCurrentUserTournamentsStatuses(sanitizeUserTourStatuses(currentUserTournamentsStatuses.value, data));

    data.forEach((newStatus) => {
        const indexTourForUpdate = userTournaments.value.findIndex(({ id }) => {
            return id === newStatus.tournament_id;
        });

        const indexUserForUpdate = userTournaments.value[indexTourForUpdate]?.top_players?.findIndex((item) => {
            return item.award_place === newStatus.award_place && item.nickname === newStatus.nickname;
        });

        if (indexTourForUpdate >= 0 && indexUserForUpdate >= 0) {
            tournamentsStore.updateUserTournament(indexTourForUpdate, indexUserForUpdate, newStatus);
        }
    });
}

