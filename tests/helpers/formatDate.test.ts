import dayjs from "dayjs";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { getEventStatus, parseCmsDate, timeFromNowUTC } from "../../src/helpers/formatDate";

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

describe("CMS event dates", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    test.each([
        [ "21/08/2026 10:00", "2026-08-21T10:00:00.000Z" ],
        [ "21/08/2026", "2026-08-21T00:00:00.000Z" ],
        [ new Date("2026-08-21T10:00:00Z"), "2026-08-21T10:00:00.000Z" ],
        [ dayjs.utc("2026-08-21T10:00:00Z"), "2026-08-21T10:00:00.000Z" ],
    ])("parses %s in UTC", (value, expected) => {
        expect(parseCmsDate(value).toISOString()).toBe(expected);
    });

    test.each([
        [ "2026-08-21T09:59:59.999Z", "future" ],
        [ "2026-08-21T10:00:00.000Z", "active" ],
        [ "2026-08-26T23:59:00.000Z", "active" ],
        [ "2026-08-26T23:59:59.999Z", "active" ],
        [ "2026-08-27T00:00:00.000Z", "archive" ],
    ])("keeps the entire end minute active at %s", (now, expected) => {
        vi.setSystemTime(new Date(now));
        const start = "21/08/2026 10:00";
        const end = "26/08/2026 23:59";

        expect(getEventStatus(start, end)).toBe(expected);
        expect(getEventStatus(parseCmsDate(start), parseCmsDate(end))).toBe(expected);
        vi.setSystemTime(new Date("2020-01-01T00:00:00Z"));
        expect(getEventStatus(start, end, new Date(now))).toBe(expected);
    });

    test("keeps date-only input and missing/invalid dates supported", () => {
        vi.setSystemTime(new Date("2026-08-21T12:00:00Z"));
        expect(getEventStatus("21/08/2026", "26/08/2026")).toBe("active");
        expect(getEventStatus(undefined, undefined)).toBe("future");
        expect(getEventStatus("invalid", "26/08/2026 23:59")).toBe("future");
        expect(parseCmsDate("31/02/2026 10:00").isValid()).toBe(false);
    });
});
