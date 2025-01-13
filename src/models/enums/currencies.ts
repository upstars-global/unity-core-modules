export enum Currencies {
    EUR = "EUR",
    USD = "USD",
    CAD = "CAD",
    AUD = "AUD",
    NOK = "NOK",
    PLN = "PLN",
    NZD = "NZD",
    JPY = "JPY",
    BRL = "BRL",
    INR = "INR",
    BTC = "BTC",
    BCH = "BCH",
    ETH = "ETH",
    LTC = "LTC",
    DOG = "DOG",
    USDT = "USDT",
    USDC = "USDC",
    BNB = "BNB",
    ADA = "ADA",
    TRX = "TRX",
}

export const currencyCodesOfCountry = {
    AU: "AUD",
    CA: "CAD",
    NZ: "NZD",
    US: "USD",
    IE: "EUR",
    DE: "EUR",
    JP: "JPY",
    NO: "NOK",
    BR: "BRL",
    AT: "EUR",
    CH: "EUR",
} as const;

export const currencyCodes = Object.values(currencyCodesOfCountry);

export type ICurrencyCode = typeof currencyCodes[number];

export default {};
