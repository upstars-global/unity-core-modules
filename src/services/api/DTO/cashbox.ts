import { Currencies } from "../../../models/enums/currencies";

export enum ActionsTransaction {
    DEPOSIT = "deposit",
    CASHOUT = "cashout"
}

export enum TypeSystemPayment {
    TYPE_SYSTEM_PAYMENT = "PAYMENT",
    TYPE_SYSTEM_PAYOUT = "PAYOUT",
}

export enum IPlayerPaymentState {
    canceled = "canceled",
    declined = "declined",
    rejected = "rejected",
    recalled = "recalled",
    succeeded = "succeeded",
    pending = "pending",
    processing = "processing",
    reserved = "reserved",
}

export interface IPlayerPayment {
    id: number;
    amount_cents: number;
    currency: Currencies;
    action: ActionsTransaction;
    payment_system: string;
    recallable: boolean;
    created_at: string;
    finished_at: string;
    system_name: string;
    state: IPlayerPaymentState;
    brand: string;
    success: boolean;
    cancellation_reason?: string;
}

export interface TransactionMetricInfo {
    type: ActionsTransaction,
    isSuccessTransaction: boolean,
    paymentSystem: string,
    amount: string,
    currency: string
}

export interface ICashboxPresets {
    userGroups: {
      [userID: string]: Record<Currencies, string[]>,
    },
    global: Record<Currencies, string[]>
}

export interface IManageWithdrawConfig {
    disable: {
        unverifiedUsersGeo: string[]
    }
}

export default {};
