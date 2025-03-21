import { linkProfile } from "@config/profile";
import { USER_STATUSES } from "@config/user-statuses";

export default (userInfo) => {
    let userName = " Visitor ";
    if (userInfo.first_name || userInfo.last_name) {
        userName = `${userInfo.first_name} ${userInfo.last_name}`;
    } else if (userInfo.email) {
        userName = userInfo.email.split("@")[0];
    }
    const groupIds = Object.keys(USER_STATUSES);
    const userHasVipStatus = userInfo.statuses?.find(({ id }) => {
        return groupIds.includes(id);
    });

    if (userHasVipStatus) {
        userName = `[${USER_STATUSES[userHasVipStatus.id]}] ${userName}`;
    }

    return {
        userName,
        status: userHasVipStatus,
        linkProfile: linkProfile + userInfo.id,
    };
};
