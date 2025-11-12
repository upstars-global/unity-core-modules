import { ID_GROUP_FOR_PAIRED_ID, ID_GROUP_FOR_UNPAIRED_ID } from "@config/groupAB";

import { log } from "../controllers/Logger";
import type { IPlayerFieldsInfo } from "../models/common";
import { useCommon } from "../store/common";
import { useUserInfo } from "../store/user/userInfo";
import { useUserStatuses } from "../store/user/userStatuses";
import { changePlayerGroup, loadBettingPlayerSettingsRequest, loadPlayerFieldsInfoRequest } from "./api/requests/player";

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

    const result = await changePlayerGroup(groupForAdding);

    if (!result) {
        const addInfo = {
            userID: userInfo.info.id,
            groupForAdding: groupForAdding,
            userGroups: userStatuses.getUserGroups,
        };
        log.error("ERROR_USER_SET_TO_GROUP_FOR_AB_TEST", addInfo);
    }
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
