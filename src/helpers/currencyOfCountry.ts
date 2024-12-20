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
};

export const currencyOfCountry = (country: string) => {
    return currencyCodesOfCountry[country as keyof typeof currencyCodesOfCountry];
};

export type CurrencyCodesOfCountry = typeof currencyCodesOfCountry;
export type CountryCode = keyof CurrencyCodesOfCountry;
