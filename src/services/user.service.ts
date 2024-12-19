import { useUserInfo } from "../store/user/userInfo";
import { useUserStatuses } from "../store/user/userStatuses";
import { addPlayerToGroup } from "./api/requests/player";

export async function userSetToGroupForAbTest() {
    const userInfo = useUserInfo();
    const userStatuses = useUserStatuses();

    const ID_GROUP_FOR_PAIRED_ID = 543;
    const ID_GROUP_FOR_UNPAIRED_ID = 544;
    const isUserIncludingInAB = userStatuses.getUserGroups.some((id) => {
        return id === ID_GROUP_FOR_PAIRED_ID || id === ID_GROUP_FOR_UNPAIRED_ID;
    });
    if (isUserIncludingInAB) {
        return;
    }
    const groupForAdding = userInfo.info.id % 2 ? ID_GROUP_FOR_UNPAIRED_ID : ID_GROUP_FOR_PAIRED_ID;

    await addPlayerToGroup(groupForAdding);
}
