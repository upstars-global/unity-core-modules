import { ID_GROUP_FOR_PAIRED_ID, ID_GROUP_FOR_UNPAIRED_ID } from "@config/groupAB";

import type { IPlayerFieldsInfo } from "../models/common";
import { useCommon } from "../store/common";
import { useUserInfo } from "../store/user/userInfo";
import { useUserStatuses } from "../store/user/userStatuses";
import { addPlayerToGroup, loadPlayerFieldsInfoRequest } from "./api/requests/player";

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

    await addPlayerToGroup(groupForAdding);
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
