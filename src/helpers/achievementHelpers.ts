
export function isAchievement(frontId: unknown) {
    return String(frontId).includes("achievement");
}

export function containAchievIdInUserStatuses(
    userStatuses: Array<{ id: string | number }>,
    itemAchievId: string | number,
) {
    return userStatuses.some((userStatus) => {
        return Number(userStatus.id) === itemAchievId;
    });
}
export function betSunCompletedInTour(betsInTour: number, targetBetSum: number) {
    return (betsInTour / targetBetSum) >= 1;
}
