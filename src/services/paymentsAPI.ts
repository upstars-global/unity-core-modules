import type { Currencies } from "../models/enums/currencies";
import type { IPaymentsMethod } from "../models/PaymentsLib";
import { IGetMethodFieldsResult, IPayloadMethodFields } from "../models/PaymentsLib";
import type { ActionsTransaction } from "./api/DTO/cashbox";


export function usePaymentsAPI() {
    function isExistPaymentsAPI () {
        return typeof window.PaymentsAPI !== "undefined";
    }

    function getPaymentMethods (currency: Currencies, paymentAction: ActionsTransaction) {
        return window.PaymentsAPI.getMethods({ currency, paymentAction }) as Promise<IPaymentsMethod[]>;
    }

    function getPaymentMethodFields (payload: IPayloadMethodFields) {
        return window.PaymentsAPI.getMethodFields(payload) as Promise<IGetMethodFieldsResult>;
    }


    async function resetCache(): Promise<void> {
        await window.PaymentsAPI.resetCache();
    }


    return {
        getPaymentMethods,
        getPaymentMethodFields,
        resetCache,
        isExistPaymentsAPI,
    };
}
