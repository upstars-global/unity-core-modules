export interface IUserStatus {
    name: string;
    id: string;
}

export interface IUserInfo {
    id: number;
    email: string;
    auth_fields_missed: string[];
    statuses: IUserStatus[];
    created_at: string;
    current_sign_in_at: string;
    confirmed_at: string;
    currency: string;
    language: string;
    deposit_bonus_code: null | string;
    can_issue_bonuses: boolean;
    profession: null;
    autoregistered: boolean;
    autologin_link: null | string;
    verified: boolean;
    license_name: string;
    sow_questionnaire_expires_at: null | string;
    two_factor_enabled: boolean;
    address: null | string;
    nickname: null | string;
    gender: null | string;
    receive_promos: boolean;
    city: null | string;
    first_name: null | string;
    receive_sms_promos: boolean;
    postal_code: null | string;
    country: null | string;
    date_of_birth: null | string;
    last_name: null | string;

    place_of_birth?: string;
    nationality?: string;
    time_zone?: string;
    receive_promos_via_phone_calls?: boolean;
    agreed_to_partner_promotions?: boolean;
    wechat?: string;
    personal_id_number?: string;
    mobile_phone?: string;
    personal_id_number_type?: string;
    title?: string;
    skype?: string;
    security_question?: string;
    security_answer?: string;
    state?: string;
    full_name?: string;
    cpf_brasil?: string;
    iban?: string;
    sumsub_verified: null | boolean;
}

export interface IUserData extends IUserInfo {
    user_id: string;
    level: number;
    hash: string;
    userDataIsSet: boolean;
    dataIsLoaded: boolean;
    dataUserLoadedOneTime: boolean;
}

export type UserGroup = string | number;

export interface IUserFormData {
    email?: string;
    password?: string;
    dfpc?: string;
    captcha?: string;
    otp?: string;
}
