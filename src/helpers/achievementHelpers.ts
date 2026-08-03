
// @ts-expect-error -- TS7006: Parameter 'frontId' implicitly has an 'any' type.
export function isAchievement(frontId) {
    return String(frontId).includes("achievement");
}

// @ts-expect-error -- TS7006: Parameter 'userStatuses' implicitly has an 'any' type.; TS7006: Parameter 'itemAchievId' implicitly has an 'any' type.
export function containAchievIdInUserStatuses(userStatuses, itemAchievId) {
    // @ts-expect-error -- TS7006: Parameter 'userStatus' implicitly has an 'any' type.
    return userStatuses.some((userStatus) => {
        return Number(userStatus.id) === itemAchievId;
    });
}
// @ts-expect-error -- TS7006: Parameter 'betsInTour' implicitly has an 'any' type.; TS7006: Parameter 'targetBetSum' implicitly has an 'any' type.
export function betSunCompletedInTour(betsInTour, targetBetSum) {
    return (betsInTour / targetBetSum) >= 1;
}
