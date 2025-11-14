export interface IUserAuthProvider {
    id: number;
    type: string;
    active: boolean;
    uid: string;
    social_network_account: string;
    confirmed_at: string;
    removable: boolean;
}

export const AUTH_PROVIDERS_MAP = {
    google_oauth2: "google",
} as const;

export type AuthProviders = keyof typeof AUTH_PROVIDERS_MAP;

export interface IAuthProvider {
    name: AuthProviders;
    url: string;
}
