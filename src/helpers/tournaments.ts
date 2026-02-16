import { IPlayersList } from "../services/api/DTO/tournamentsDTO";

export function sanitizeUserTourStatuses(tournamentStatues: IPlayersList, newStatuses: IPlayersList): IPlayersList {
    return [
        ...tournamentStatues
            .filter(({ tournament_id }) => {
                return !newStatuses.some(({ tournament_id: newID }) => {
                    return newID === tournament_id;
                });
            }),
        ...newStatuses,
    ];
}
