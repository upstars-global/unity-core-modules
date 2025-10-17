import { log } from "../../../controllers/Logger";
import { type ICurrentUserQuestsStatus } from "../../../models/quest";
import { IPlayer, IPlayerConfirmation, IPlayersList, ITournament, ITournamentsList } from "../DTO/tournamentsDTO";
import { http } from "../http";

export async function loadTournamentsListReq(): Promise<ITournamentsList> {
    try {
        const { data } = await http().get<ITournamentsList>("/api/tournaments");
        return data;
    } catch (err: unknown) {
        log.error("LOAD_USER_TOURNAMENTS_ERROR", err);
        throw err;
    }
}

export async function loadTournamentByIdReq(id: number): Promise<ITournament | void> {
    try {
        const { data } = await http().get<ITournament>(`/api/tournaments/${ id }`);
        return data;
    } catch (err: unknown) {
        log.error("LOAD_TOURNAMENT_BY_ID_ERROR", err);
    }
}

export async function chooseTournamentReq(id: number): Promise<IPlayerConfirmation> {
    try {
        const { data } = await http().post<IPlayerConfirmation>(
            `/api/tournaments/${ id }/confirm`,
            { confirmed: true },
        );
        return data;
    } catch (err: unknown) {
        log.error("CHOOSE_TOURNAMENT_ERROR", err);
        throw err;
    }
}

export async function loadUserTournamentsReq(): Promise<ITournamentsList> {
    try {
        const { data } = await http().get<ITournamentsList>("/api/tournaments/player");
        return data;
    } catch (err: unknown) {
        log.error("LOAD_USER_TOURNAMENTS_ERROR", err);
        throw err;
    }
}

export async function loadUserStatusesReq(id: number): Promise<IPlayer> {
    try {
        const { data } = await http().get<IPlayer>(`/api/tournaments/${ id }/status`);
        return data;
    } catch (err: unknown) {
        log.error("LOAD_CURRENT_USER_TOUR_STATUSES_ERROR", err);
        throw err;
    }
}

export async function loadQuestDataReq(questList: ITournament[]): Promise<ICurrentUserQuestsStatus[] | void> {
    try {
        const statuses = await Promise.allSettled(
            questList.map((questItem) => {
                return http().get(`/api/tournaments/${ questItem.id }/status`);
            }),
        );

        return statuses.map((item) => {
            if (item.status === "fulfilled") {
                return item.value.data;
            }

            return {};
        }) as ICurrentUserQuestsStatus[];
    } catch (err) {
        log.error("LOAD_QUESTS_DATA_ERROR", err);
    }
}

export async function updateUserStatusesReq(id: number): Promise<IPlayersList> {
    try {
        const { data } = await http().get<IPlayersList>(`/api/tournaments/${ id }/status`);
        return data;
    } catch (err: unknown) {
        log.error("LOAD_CURRENT_USER_TOUR_STATUSES_ERROR", err);
        throw err;
    }
}

export async function loadRecentTournamentsReq(): Promise<ITournamentsList> {
    try {
        const { data } = await http().get<ITournamentsList>("/api/tournaments/recent");
        return data;
    } catch (err: unknown) {
        log.error("LOAD_RECENT_TOURNAMENTS_ERROR", err);
        throw err;
    }
}
