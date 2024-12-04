export type LocaleName = string;

export interface ILocale {
    code: string;
    name: LocaleName;
    name_in_locale: string;
    default: boolean;
}

export type Locales = ILocale[];
