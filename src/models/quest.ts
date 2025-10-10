import { ITournament } from "../services/api/DTO/tournamentsDTO";

interface ILabel {
    title: string;
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

export interface IQuestItem extends ITournament {
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
