const linkProfile = "https://rocketplay.casino-backend.com/backend/players/";
const mapGroupName = {
    255: "PLATINUM",
    256: "STAR",
    257: "BRONZE",
    258: "SILVER",
    259: "GOLD",
    21: "TEST",
};

export default (userInfo) => {
    let userName = " Visitor ";
    if (userInfo.first_name || userInfo.last_name) {
        userName = `${userInfo.first_name} ${userInfo.last_name}`;
    } else if (userInfo.email) {
        userName = userInfo.email.split("@")[0];
    }
    const groupIds = Object.keys(mapGroupName);
    const userHasVipStatus = userInfo.statuses?.find(({ id }) => {
        return groupIds.includes(id);
    });

    if (userHasVipStatus) {
        userName = `[${mapGroupName[userHasVipStatus.id]}] ${userName}`;
    }

    return {
        userName,
        status: userHasVipStatus,
        linkProfile: linkProfile + userInfo.id,
    };
};
