import type { ActionsTransaction } from "../services/api/DTO/cashbox";
import type { IFieldConfig } from "./common";
import type { Currencies } from "./enums/currencies";

enum PaymentLibMethodsTypes {
    BankTransfer = "bank_transfer",
    Cards = "cards",
    Crypto = "crypto",
    Direct = "direct",
    Voucher = "voucher",
}

type MethodType = PaymentLibMethodsTypes.BankTransfer |
    PaymentLibMethodsTypes.Cards |
    PaymentLibMethodsTypes.Crypto |
    PaymentLibMethodsTypes.Direct |
    PaymentLibMethodsTypes.Voucher;

interface ISavedProfile {
    id: string;
    isRemoveAvailable: boolean;
    title: string;
}

export interface IPaymentsMethod {
    brand: string;
    description: null | string;
    extraIcons: string;
    iconSrc: null | string;
    id: string;
    isForSavedProfilesOnly: boolean;
    isProfileRequiredForCashout: boolean;
    provider: Record<string, unknown>;
    savedProfiles: ISavedProfile[];
    termsOfService: unknown;
    title: null | string;
    translationKey: string;
    type: MethodType;
}

type MethodField = Record<string, unknown>;

interface IGetMethodFieldsResult {
    amountField: null | MethodField;
    isSubmitAvailable: boolean;
    methodFields: MethodField[];
    playerFields: IFieldConfig[];
}

declare global {
    interface Window {
        PaymentsAPI: {
            getMethods: (config: {
                currency: Currencies,
                paymentAction: ActionsTransaction,
            }) => Promise<IPaymentsMethod[]>;

            getMethodFields: (config: {
                id: string;
                currency: string;
                paymentAction: ActionsTransaction;
                savedProfileId?: string;
            }) => Promise<IGetMethodFieldsResult>;

            resetCache: () => Promise<void>;
        };
    }
}
