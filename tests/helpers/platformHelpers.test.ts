import type { IResult } from "ua-parser-js";
import { describe, expect, it } from "vitest";

import { getBrowserName, isAndroidUserAgent, isIOSUserAgent } from "../../src/helpers/platformHelpers";

describe("platformHelpers", () => {
    describe("isAndroidUserAgent", () => {
        it("should return false if uaHints is undefined", () => {
            expect(isAndroidUserAgent(undefined as unknown as IResult)).toBe(false);
        });

        it("should return true if os.name is Android", () => {
            const uaHints: IResult = { os: { name: "Android" } } as IResult;
            expect(isAndroidUserAgent(uaHints)).toBe(true);
        });

        it("should return false if os.name is not Android", () => {
            const uaHints: IResult = { os: { name: "iOS" } } as IResult;
            expect(isAndroidUserAgent(uaHints)).toBe(false);
        });

        it("should detect Android from userAgent string", () => {
            const uaHints: IResult = { ua: "Mozilla/5.0 (Linux; Android 10)" } as IResult;
            expect(isAndroidUserAgent(uaHints)).toBe(true);
        });

        it("should return false for non-Android userAgent string", () => {
            const uaHints: IResult = { ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)" } as IResult;
            expect(isAndroidUserAgent(uaHints)).toBe(false);
        });
    });

    describe("isIOSUserAgent", () => {
        it("should return false if uaHints is undefined", () => {
            expect(isIOSUserAgent(undefined as unknown as IResult)).toBe(false);
        });

        it("should return true if os.name is iOS", () => {
            const uaHints: IResult = { os: { name: "iOS" } } as IResult;
            expect(isIOSUserAgent(uaHints)).toBe(true);
        });

        it("should return false if os.name is not iOS", () => {
            const uaHints: IResult = { os: { name: "Android" } } as IResult;
            expect(isIOSUserAgent(uaHints)).toBe(false);
        });

        it("should detect iOS from device model", () => {
            const uaHints: IResult = { device: { model: "iPhone" } } as IResult;
            expect(isIOSUserAgent(uaHints)).toBe(true);
        });

        it("should return false for non-iOS devices", () => {
            const uaHints: IResult = { device: { model: "Pixel 6" } } as IResult;
            expect(isIOSUserAgent(uaHints)).toBe(false);
        });

        it("should detect iOS from userAgent string", () => {
            const uaHints: IResult = { ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)" } as IResult;
            expect(isIOSUserAgent(uaHints)).toBe(true);
        });

        it("should return false for non-iOS userAgent string", () => {
            const uaHints: IResult = { ua: "Mozilla/5.0 (Linux; Android 10)" } as IResult;
            expect(isIOSUserAgent(uaHints)).toBe(false);
        });
    });

    describe("getBrowserName", () => {
        it("should return browser name if defined", () => {
            const uaHints: IResult = { browser: { name: "Chrome" } } as IResult;
            expect(getBrowserName(uaHints)).toBe("Chrome");
        });

        it("should return undefined if browser name is not present", () => {
            const uaHints: IResult = { browser: {} } as IResult;
            expect(getBrowserName(uaHints)).toBeUndefined();
        });

        it("should return undefined if uaHints is empty", () => {
            expect(getBrowserName({} as IResult)).toBeUndefined();
        });
    });
});
