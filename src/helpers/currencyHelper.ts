const CODE_ETH = "ETH";
const CODE_LTC = "LTC";
const CODE_BTC = "BTC";

const MILLI_COUNT = 1e-3;
const MICRO_COUNT = 1e-6;

const SYMBOL_MILLI = "m";
const SYMBOL_MICRO = "µ";

export const COUNT_SATOSHI_BY_CURRENCY: Record<string, number> = {
    [CODE_ETH]: MILLI_COUNT,
    [CODE_LTC]: MILLI_COUNT,
    [CODE_BTC]: MICRO_COUNT,
};

const SYMBOL_SATOSHI_BY_CURRENCY: Record<string, string> = {
    [CODE_ETH]: SYMBOL_MILLI,
    [CODE_LTC]: SYMBOL_MILLI,
    [CODE_BTC]: SYMBOL_MICRO,
};

export const currencyView = (
    value: unknown,
    currency?: string,
    toCeil: boolean | null = false,
    subUntil = 1,
    maxFractionDigits = 8,
    transformCrypto = true,
) => {
    let normalizeValue = Number(value);
    if (isNaN(normalizeValue)) {
        return `${value as string | number} ${currency || ""}`;
    }

    normalizeValue = (toCeil) ? Math.ceil(normalizeValue / subUntil) : (normalizeValue / subUntil);

    if (currency) {
        let countCurrency = 1;
        let prefixCurrency = "";

        if (transformCrypto) {
            countCurrency = COUNT_SATOSHI_BY_CURRENCY[currency] || 1;
            prefixCurrency = SYMBOL_SATOSHI_BY_CURRENCY[currency] || "";
        }

        return `${(normalizeValue / countCurrency).toLocaleString(
            undefined,
            { maximumFractionDigits: maxFractionDigits },
        )} ${prefixCurrency}${currency}`;
    }

    return normalizeValue.toLocaleString(undefined, { maximumFractionDigits: maxFractionDigits });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sanitizeNumber = (num: unknown, separator = ","): any => {
    return (num as { toString(): string }).toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
};

export const parseFloatFromString = (value = "") => parseFloat(value.replace(/[^\d.]+/g, ""));
