export enum Currencies {
    EUR = "EUR",
    USD = "USD",
    NOK = "NOK",
    CAD = "CAD",
    PLN = "PLN",
    NZD = "NZD",
    JPY = "JPY",
    AUD = "AUD",
    BRL = "BRL",
    INR = "INR",
    USDC = "USDC",
    BTC = "BTC",
    ETH = "ETH",
    LTC = "LTC",
    BCH = "BCH",
    DOG = "DOG",
    USDT = "USDT",
    BNB = "BNB",
    ADA = "ADA",
    TRX = "TRX",
}

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
