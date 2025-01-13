import { currencyCodes, currencyCodesOfCountry, ICurrencyCode } from "../models/enums/currencies";

export const currencyOfCountry = (country: string) => {
    return currencyCodesOfCountry[country as CountryCode];
};

export const isValidCurrency = (currency: string | undefined): currency is ICurrencyCode => {
    return currency ? currencyCodes.includes(currency as ICurrencyCode) : false;
};

export type CurrencyCodesOfCountry = typeof currencyCodesOfCountry;
export type CountryCode = keyof CurrencyCodesOfCountry;
