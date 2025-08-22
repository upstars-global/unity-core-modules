import { describe, expect, it } from "vitest";

import { COUNT_SATOSHI_BY_CURRENCY, currencyView, parseFloatFromString, sanitizeNumber } from "../../src/helpers/currencyHelper";

describe("currencyHelper", () => {
    it("currencyView formats with currency and subunits", () => {
        const result = currencyView(123456, "BTC", false, 100, 8);
        // 123456 / 100 = 1234.56; BTC uses MICRO (1e-6), so divide by 1e-6 => multiply by 1e6
        expect(result).toContain(" µBTC");
    });

    it("currencyView handles non-numeric input", () => {
        expect(currencyView("x" as unknown as number, "USD", false, 1)).toBe("x USD");
    });

    it("currencyView without currency", () => {
        expect(currencyView(1000, undefined as unknown as string, false, 1)).toBe("1,000");
    });

    it("sanitizeNumber inserts separators", () => {
        expect(sanitizeNumber(1234567)).toBe("1,234,567");
    });

    it("parseFloatFromString extracts number", () => {
        expect(parseFloatFromString("$1,234.56 AUD")).toBe(1234.56);
    });

    it("COUNT_SATOSHI_BY_CURRENCY includes BTC/ETH/LTC keys", () => {
        expect(Object.keys(COUNT_SATOSHI_BY_CURRENCY)).toEqual(expect.arrayContaining([ "BTC", "ETH", "LTC" ]));
    });
});
