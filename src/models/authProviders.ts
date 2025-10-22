export interface IAuthProvider {
    name: string;
    url: string;
}

export interface IUserAuthProvider {
    id: number;
    type: string;
    active: boolean;
    uid: string;
    social_network_account: string;
    confirmed_at: string;
    removable: boolean;
}
