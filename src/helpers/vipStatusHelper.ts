// @ts-expect-error -- TS2307: Cannot find module '@config/profile' or its corresponding type declarations.
import { linkProfile } from "@config/profile";
// @ts-expect-error -- TS2307: Cannot find module '@config/user-statuses' or its corresponding type declarations.
import { USER_STATUSES } from "@config/user-statuses";

// @ts-expect-error -- TS7006: Parameter 'userInfo' implicitly has an 'any' type.
export default (userInfo) => {
    let userName = " Visitor ";
    if (userInfo.first_name || userInfo.last_name) {
        userName = `${userInfo.first_name} ${userInfo.last_name}`;
    } else if (userInfo.email) {
        userName = userInfo.email.split("@")[0];
    }
    const groupIds = Object.keys(USER_STATUSES);
    // @ts-expect-error -- TS7031: Binding element 'id' implicitly has an 'any' type.
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
