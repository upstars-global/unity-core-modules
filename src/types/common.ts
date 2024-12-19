export interface IMapImages {
    img: string;
    imgRetina: string;
}

export enum EnumFormFields {
    first_name = "first_name",
    last_name = "last_name",
    nickname = "nickname",
    date_of_birth = "date_of_birth",
    gender = "gender",
    country = "country",
    city = "city",
    address = "address",
    postal_code = "postal_code",
    receive_promos = "receive_promos",
    receive_sms_promos = "receive_sms_promos",
    mobile_phone = "mobile_phone",
    state = "state",
}

export enum EnumContextFields {
    registration = "registration",
    deposit = "deposit",
    cashout = "cashout",
    edition = "edition",
    authentic = "authentic",
    egt = "egt",
    epicmedia = "epicmedia",
    evolution = "evolution",
    groove = "groove",
    netent = "netent",
    playngo = "playngo",
    playtech = "playtech",
    pushgaming = "pushgaming",
    quickfire = "quickfire",
    redtiger = "redtiger",
    swintt = "swintt",
    yggdrasil = "yggdrasil",
    kiron = "kiron",
    felixgaming = "felixgaming",
    fugaso = "fugaso",
}

export interface IFieldConfig {
    field: string;
    type: string;
    length?: {
        "minimum": number;
        "maximum": number
    };
    once_set?: boolean;
    age?: {
        "min": {
            "default": number;
        }
    };
    service?: number;
    inclusion?: {
        in?: string[]
    };
}

export interface IPlayerFieldsInfo {
    "fields": IFieldConfig[];
    contexts: {
        [key: EnumContextFields]: EnumFormFields[];
        payment_systems: Record<string, {
            base: {
                "deposit": EnumFormFields
                "cashout": EnumFormFields

            }
        }>;
    };
}
