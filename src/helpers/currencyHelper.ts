const CODE_ETH = "ETH";
const CODE_LTC = "LTC";
const CODE_BTC = "BTC";

const MILLI_COUNT = 1e-3;
const MICRO_COUNT = 1e-6;

const SYMBOL_MILLI = "m";
const SYMBOL_MICRO = "µ";

export const COUNT_SATOSHI_BY_CURRENCY = {
    [CODE_ETH]: MILLI_COUNT,
    [CODE_LTC]: MILLI_COUNT,
    [CODE_BTC]: MICRO_COUNT,
};

const SYMBOL_SATOSHI_BY_CURRENCY = {
    [CODE_ETH]: SYMBOL_MILLI,
    [CODE_LTC]: SYMBOL_MILLI,
    [CODE_BTC]: SYMBOL_MICRO,
};

// @ts-expect-error -- TS7006: Parameter 'value' implicitly has an 'any' type.; TS7006: Parameter 'currency' implicitly has an 'any' type.; TS7006: Parameter 'toCeil' implicitly has an 'any' type.
export const currencyView = (value, currency, toCeil, subUntil = 1, maxFractionDigits = 8, transformCrypto = true) => {
    let normalizeValue = Number(value);
    if (isNaN(normalizeValue)) {
        return `${value} ${currency || ""}`;
    }

    normalizeValue = (toCeil) ? Math.ceil(normalizeValue / subUntil) : (normalizeValue / subUntil);

    if (currency) {
        let countCurrency = 1;
        let prefixCurrency = "";

        if (transformCrypto) {
            // @ts-expect-error -- TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ ETH: number; LTC: number; BTC: number; }'.
            countCurrency = COUNT_SATOSHI_BY_CURRENCY[currency] || 1;
            // @ts-expect-error -- TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ ETH: string; LTC: string; BTC: string; }'.
            prefixCurrency = SYMBOL_SATOSHI_BY_CURRENCY[currency] || "";
        }

        return `${(normalizeValue / countCurrency).toLocaleString(
            undefined,
            { maximumFractionDigits: maxFractionDigits },
        )} ${prefixCurrency}${currency}`;
    }

    return normalizeValue.toLocaleString(undefined, { maximumFractionDigits: maxFractionDigits });
};

// @ts-expect-error -- TS7006: Parameter 'num' implicitly has an 'any' type.
export const sanitizeNumber = (num, separator = ",") => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);

export const parseFloatFromString = (value = "") => parseFloat(value.replace(/[^\d.]+/g, ""));
