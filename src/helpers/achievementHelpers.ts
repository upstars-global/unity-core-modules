
export function isAchievement(frontId) {
    return String(frontId).includes("achievement");
}

export function containAchievIdInUserStatuses(userStatuses, itemAchievId) {
    return userStatuses.some((userStatus) => {
        return Number(userStatus.id) === itemAchievId;
    });
}
export function betSunCompletedInTour(betsInTour, targetBetSum) {
    return (betsInTour / targetBetSum) >= 1;
}
