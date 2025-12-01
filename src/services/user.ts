import { ID_GROUP_FOR_PAIRED_ID, ID_GROUP_FOR_UNPAIRED_ID } from "@config/groupAB";
import { storeToRefs } from "pinia";

import { log } from "../controllers/Logger";
import type { IPlayerFieldsInfo } from "../models/common";
import type { IUserGameHistoryItem } from "../models/user";
import { useCommon } from "../store/common";
import { useUserDocuments } from "../store/user/userDocuments";
import { userGamesHistory } from "../store/user/userGamesHistory";
import { useUserInfo } from "../store/user/userInfo";
import { useUserStatuses } from "../store/user/userStatuses";
import { useUserVerificationSumsub } from "../store/user/userVerificationSumsub";
import { http } from "./api/http";
import { deleteDocument, loadDocuments, uploadDocuments } from "./api/requests/documents";
import { loadBettingPlayerSettingsRequest, loadPlayerFieldsInfoRequest } from "./api/requests/player";
import { getSumsubTokenReq } from "./api/requests/sumsub";

export async function userSetToGroupForAbTest() {
    const userInfo = useUserInfo();
    const userStatuses = useUserStatuses();

    const isUserIncludingInAB = userStatuses.getUserGroups.some((id) => {
        return id === ID_GROUP_FOR_PAIRED_ID || id === ID_GROUP_FOR_UNPAIRED_ID;
    });
    if (isUserIncludingInAB) {
        return;
    }
    const groupForAdding = userInfo.info.id % 2 ? ID_GROUP_FOR_UNPAIRED_ID : ID_GROUP_FOR_PAIRED_ID;

    await userStatuses.changeUserToGroup(groupForAdding);
}

export async function loadPlayerFieldsInfo({ reload } = { reload: false }): Promise<IPlayerFieldsInfo> {
    const { playerFieldsInfo, setPlayerFieldsInfo } = useCommon();

    if (playerFieldsInfo && !reload) {
        return playerFieldsInfo;
    }

    const data = await loadPlayerFieldsInfoRequest();

    if (data) {
        setPlayerFieldsInfo(data);
    }
}

export async function loadBettingPlayerSettings() {
    try {
        const data = await loadBettingPlayerSettingsRequest();
        const { setBettingPlayerSettings } = useUserInfo();

        if (data) {
            setBettingPlayerSettings({
                oddsTypes: data.odds_types.available,
                selectedOddsType: data.odds_types.selected,
            });
        }
    } catch (error) {
        log.error("LOAD_BETTING_PLAYER_SETTINGS_ERROR", error);
    }
}

export async function loadSumsubToken(): Promise<string> {
    const { setAccessToken } = useUserVerificationSumsub();
    const response = await getSumsubTokenReq();

    if (response?.access_token) {
        setAccessToken(response.access_token);
    }

    return response?.access_token || "";
}


export async function loadUserDocs({ reload = false } = {}) {
    const userDocumentsStore = useUserDocuments();
    const { documents } = storeToRefs(userDocumentsStore);

    try {
        if (!reload && documents.value.length) {
            return documents.value;
        }

        const data = await loadDocuments();

        if (Array.isArray(data)) {
            userDocumentsStore.setDocuments(data);

            return data;
        }
    } catch (err) {
        log.error("LOAD_USER_DOCS_ERROR", err);
    }
}

export async function uploadUserDoc({ file, description }: { file: File, description: string }): Promise<void | Error> {
    try {
        await uploadDocuments(file, description);

        loadUserDocs({ reload: true });
    } catch (err) {
        log.error("UPLOAD_USER_DOC", err);
        throw err;
    }
}

export async function deleteUserDoc(id: string): Promise<void> {
    try {
        await deleteDocument(id);

        await loadUserDocs({ reload: true });
    } catch (err) {
        log.error("DELETE_USER_DOC", err);
    }
}

export async function loadUserGameHistory() {
    try {
        const userGamesHistoryStore = userGamesHistory();

        const { data } = await http().get<IUserGameHistoryItem[]>("/api/player/games");

        userGamesHistoryStore.setGamesHistory(data);
    } catch (err) {
        log.error("LOAD_USER_GAMES_HISTORY", err);
    }
}
