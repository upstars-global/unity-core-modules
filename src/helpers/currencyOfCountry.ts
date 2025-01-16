import { currencyCodesOfCountry } from "../models/enums/currencies";

export const currencyOfCountry = (country: string) => {
    return currencyCodesOfCountry[country as keyof typeof currencyCodesOfCountry];
};

export type CurrencyCodesOfCountry = typeof currencyCodesOfCountry;
export type CountryCode = keyof CurrencyCodesOfCountry;
