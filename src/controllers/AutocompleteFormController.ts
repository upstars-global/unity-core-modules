import { isServer } from "../helpers/ssrHelpers";

export const LOCAL_STORAGE_NAME = "autocomplete_form";

export enum AUTOCOMPLETE_FORM_NAME {
    LOGIN = "login",
    REGISTRATION = "registration",
};
export type IAutocompleteField = {
    [fieldName: string]: string;
}
export type IAutocompleteForm = {
    [formName in AUTOCOMPLETE_FORM_NAME]: IAutocompleteField | null;
};

export function getAutocompleteForm(fieldName?: AUTOCOMPLETE_FORM_NAME): IAutocompleteForm | void {
    if (!isServer) {
        const currentData = localStorage.getItem(LOCAL_STORAGE_NAME);

        if (currentData) {
            if (fieldName) {
                return JSON.parse(currentData)[fieldName];
            }

            return JSON.parse(currentData);
        }
    }
}

export function setAutocompleteField(formName: AUTOCOMPLETE_FORM_NAME, fieldValue: IAutocompleteField): void {
    if (!isServer) {
        const currentDataCommon = getAutocompleteForm() || {};
        const currentDataForm = getAutocompleteForm(formName) || {};
        const newData = {
            ...currentDataCommon,
            [formName]: {
                ...currentDataForm,
                ...fieldValue,
            },
        } as IAutocompleteForm;

        localStorage.setItem(LOCAL_STORAGE_NAME, JSON.stringify(newData));
    }
}


export function clearAllAutocompleteForm(): void {
    if (!isServer) {
        localStorage.removeItem(LOCAL_STORAGE_NAME);
    }
}

export function removeCurrentAutocompleteForm(formName: AUTOCOMPLETE_FORM_NAME): void {
    if (!isServer) {
        const currentData = getAutocompleteForm() || {} as IAutocompleteForm;

        if (currentData[formName]) {
            delete currentData[formName];
            localStorage.setItem(LOCAL_STORAGE_NAME, JSON.stringify(currentData));
        }
    }
}
