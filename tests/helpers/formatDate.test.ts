import { afterEach, describe, expect, test, vi } from "vitest";

import { timeFromNowUTC } from "../../src/helpers/formatDate";

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
