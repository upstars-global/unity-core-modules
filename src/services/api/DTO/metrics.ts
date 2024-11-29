import type { FormFields } from "../../../models/enums/formFields";

export enum SideMetricsErrorsValidationForm {
    backEnd = "backEnd",
    frontEnd = "frontEnd"
}

export enum FormComponentName {
    UserInfoStep = "UserInfoStep",
    UserInfoAddress = "UserInfoAddress",
    ProfileEdit = "ProfileEdit",
    CashboxOthersForms = "CashboxOthersForms",
    LoginForm = "LoginForm",
    RegistrationForm = "RegistrationForm",
}

export type IFormErrorsCollection = Record<string, string[]>;

export interface IFormErrorsCollectionMetric {
    key: FormFields;
    firstMessage: string;
}

export interface IErrorsValidationForm {
    side: SideMetricsErrorsValidationForm;
    component: FormComponentName;
    errors: IFormErrorsCollection;
}

export interface IMetricsErrorsValidationForm {
    side: SideMetricsErrorsValidationForm;
    component: string;
    errors: IFormErrorsCollectionMetric[];
}
