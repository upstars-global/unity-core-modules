import dayjs from "dayjs";
import { afterEach, describe, expect, test, vi } from "vitest";

import { parseCmsDate, timeFromNowUTC } from "../../src/helpers/formatDate";

describe("timeFromNowUTC", () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    test("returns relative time for the default Smartico date format", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-09-14T14:50:00.000Z"));

        expect(timeFromNowUTC("14/09/2026 14:20:00")).toBe("30 minutes ago");
    });

    test("returns undefined for an invalid date", () => {
        expect(timeFromNowUTC("invalid date")).toBeUndefined();
    });
});

describe("parseCmsDate", () => {
    test.each([
        [ "21/08/2026 10:00", "2026-08-21T10:00:00.000Z" ],
        [ "21/08/2026", "2026-08-21T00:00:00.000Z" ],
        [ new Date("2026-08-21T10:00:00Z"), "2026-08-21T10:00:00.000Z" ],
        [ dayjs.utc("2026-08-21T10:00:00Z"), "2026-08-21T10:00:00.000Z" ],
    ])("parses %s in UTC", (value, expected) => {
        expect(parseCmsDate(value).toISOString()).toBe(expected);
    });

    test("rejects an invalid strict date", () => {
        expect(parseCmsDate("31/02/2026 10:00").isValid()).toBe(false);
    });
});
