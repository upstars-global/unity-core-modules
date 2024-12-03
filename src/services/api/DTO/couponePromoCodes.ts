export interface IActiveCouponResp {
    "bonus_id": string;
    "name": string;
    "bonus_type": string;
}

export enum UserCouponStatuses {
    alreadyActivated = "already_activated",
    failedActivate = "failed_to_activate",
    successfullyActivated = "successfully_activated",
}
