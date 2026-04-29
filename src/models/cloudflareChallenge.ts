export enum CloudflareChallengeReason {
    Login = "login",
    Registration = "registration",
}

export interface CloudflareChallengeContext {
    reason?: CloudflareChallengeReason;
    returnTo?: string;
}

export interface CloudflareChallengeRequiredPayload extends CloudflareChallengeContext {
    method?: string;
    status?: number;
    url?: string;
}
