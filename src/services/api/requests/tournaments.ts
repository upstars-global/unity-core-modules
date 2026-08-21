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

export async function loadQuestDataReq(questList: ITournament[]): Promise<ICurrentUserQuestsStatus[] | void> {
    try {
        if (questList.length === 0) {
            return [];
        }

        const questIds = questList.map((questItem) => questItem.id);
        const statusesMap = await loadBatchTournamentStatusesReq(questIds);

        return questIds.map((id) => {
            const playerData = statusesMap[id];
            if (!playerData) return {} as ICurrentUserQuestsStatus;

            return {
                tournament_id: playerData.tournament_id,
                nickname: playerData.nickname,
                user_confirmed: null,
                bets: Number(playerData.bets) || 0,
                bet_cents: playerData.bet_cents,
                wins: Number(playerData.wins) || 0,
                win_cents: playerData.win_cents,
                rate: playerData.rate,
                games_taken: playerData.games_taken,
                award_place: null,
                award_place_in_team: null,
                points: playerData.points,
                tournament_team_id: null,
            } as ICurrentUserQuestsStatus;
        }).filter(Boolean);
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

export async function loadBatchTournamentStatusesReq(ids: number[]): Promise<Record<number, IPlayer>> {
    try {
        const urls = ids.map(id => `api/tournaments/${id}/status`);
        
        // Remove duplicate URLs to prevent processing the same tournament multiple times
        const uniqueUrls = Array.from(new Set(urls));
        
        // API provider limitation: process URLs in chunks of 12
        const CHUNK_SIZE = 12;
        const urlChunks: string[][] = [];
        for (let i = 0; i < uniqueUrls.length; i += CHUNK_SIZE) {
            urlChunks.push(uniqueUrls.slice(i, i + CHUNK_SIZE));
        }

        const transformedData: Record<number, IPlayer> = {};
        
        // Process each chunk sequentially
        for (const chunk of urlChunks) {
            const params = new URLSearchParams();
            chunk.forEach(url => params.append('url[]', url));
            const { data } = await http().get<Record<number, IPlayer> | string[]>(`/batch?${ params.toString() }`);
            
            if (typeof data === 'object' && data !== null) {
                Object.values(data).forEach((playerData) => {
                    if (playerData && playerData.tournament_id) {
                        transformedData[playerData.tournament_id] = playerData;
                    }
                });
            }
        }

        return transformedData;
    } catch (err: unknown) {
        log.error("LOAD_BATCH_TOURNAMENT_STATUSES_ERROR", err);
        throw err;
    }
}
