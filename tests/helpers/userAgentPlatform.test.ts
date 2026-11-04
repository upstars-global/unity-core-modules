import type { IResult } from "ua-parser-js";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const macSafariUA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15";
const frozenChromeUA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const iPhoneUA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

let clientHintResult = { mobile: true, platform: "Android", model: "Pixel 8", formFactors: [ "Mobile" ] };
const clientHints = {
    mobile: false,
    getHighEntropyValues: vi.fn(async () => clientHintResult),
};
const navigatorMock = {
    userAgent: macSafariUA,
    standalone: false,
    maxTouchPoints: 0,
    userAgentData: clientHints as typeof clientHints | undefined,
};
let displayModeStandalone = false;
const windowMock = {
    navigator: navigatorMock,
    matchMedia: vi.fn(() => ({ matches: displayModeStandalone })),
};
let getUserAgentPlatform: typeof import("../../src/helpers/userAgentPlatform").getUserAgentPlatform;

describe("getUserAgentPlatform", () => {
    beforeAll(async () => {
        vi.stubGlobal("navigator", navigatorMock);
        vi.stubGlobal("window", windowMock);
        ({ getUserAgentPlatform } = await import("../../src/helpers/userAgentPlatform"));
    });

    beforeEach(() => {
        navigatorMock.userAgent = macSafariUA;
        navigatorMock.standalone = false;
        navigatorMock.maxTouchPoints = 0;
        navigatorMock.userAgentData = undefined;
        displayModeStandalone = false;
        clientHintResult = { mobile: true, platform: "Android", model: "Pixel 8", formFactors: [ "Mobile" ] };
        clientHints.getHighEntropyValues.mockClear();
        windowMock.matchMedia.mockClear();
        vi.stubGlobal("navigator", navigatorMock);
        vi.stubGlobal("window", windowMock);
    });

    afterAll(() => {
        vi.unstubAllGlobals();
    });

    it.each([
        { deviceType: "mobile", osName: "macOS", isMobile: true },
        { deviceType: "tablet", osName: "macOS", isMobile: true },
        { deviceType: "desktop", osName: "iOS", isMobile: false },
        { deviceType: undefined, osName: "Android", isMobile: true },
        { deviceType: undefined, osName: "iOS", isMobile: true },
        { deviceType: undefined, osName: "macOS", isMobile: false },
        { deviceType: undefined, osName: undefined, isMobile: false },
    ])("uses supplied hints for device $deviceType and OS $osName", async ({ deviceType, osName, isMobile }) => {
        const hints = { ua: "supplied UA", device: { type: deviceType }, os: { name: osName } } as IResult;
        const platform = await getUserAgentPlatform(hints);

        expect(platform).toEqual({
            isMobile,
            transitionName: "slide-left",
            userAgent: "supplied UA",
            userAgentHints: hints,
        });
    });

    it("returns the default state during SSR", async () => {
        vi.stubGlobal("window", undefined);

        expect(await getUserAgentPlatform()).toEqual({
            isMobile: false,
            transitionName: "slide-left",
            userAgentHints: undefined,
        });
    });

    it("uses Client Hints for a frozen User-Agent", async () => {
        navigatorMock.userAgent = frozenChromeUA;
        navigatorMock.userAgentData = clientHints;

        const platform = await getUserAgentPlatform();

        expect(platform.isMobile).toBe(true);
        expect(platform.userAgent).toBe(frozenChromeUA);
        expect(platform.userAgentHints?.device.type).toBe("mobile");
        expect(clientHints.getHighEntropyValues).toHaveBeenCalledOnce();
    });

    it("recognizes a tablet from Client Hints", async () => {
        navigatorMock.userAgent = frozenChromeUA;
        navigatorMock.userAgentData = clientHints;
        clientHintResult = { mobile: false, platform: "Android", model: "Pixel Tablet", formFactors: [ "Tablet" ] };

        const platform = await getUserAgentPlatform();

        expect(platform.isMobile).toBe(true);
        expect(platform.userAgentHints?.device.type).toBe("tablet");
    });

    it("uses the parsed device for a non-frozen User-Agent with Client Hints available", async () => {
        navigatorMock.userAgent = iPhoneUA;
        navigatorMock.userAgentData = clientHints;

        const platform = await getUserAgentPlatform();

        expect(platform.isMobile).toBe(true);
        expect(platform.userAgentHints?.device.type).toBe("mobile");
        expect(clientHints.getHighEntropyValues).not.toHaveBeenCalled();
    });

    it("recognizes an iPad with Client Hints available", async () => {
        navigatorMock.maxTouchPoints = 5;
        navigatorMock.userAgentData = clientHints;

        const platform = await getUserAgentPlatform();

        expect(platform.isMobile).toBe(true);
        expect(platform.userAgentHints?.device.type).toBe("tablet");
        expect(clientHints.getHighEntropyValues).not.toHaveBeenCalled();
    });

    it.each([
        { maxTouchPoints: 5, isMobile: true, deviceType: "tablet" },
        { maxTouchPoints: 0, isMobile: false, deviceType: undefined },
    ])("detects iPadOS with $maxTouchPoints touch points", async ({ maxTouchPoints, isMobile, deviceType }) => {
        navigatorMock.maxTouchPoints = maxTouchPoints;

        const platform = await getUserAgentPlatform();

        expect(platform.isMobile).toBe(isMobile);
        expect(platform.userAgentHints?.device.type).toBe(deviceType);
    });

    it("treats a standalone app as mobile", async () => {
        navigatorMock.standalone = true;

        expect((await getUserAgentPlatform()).isMobile).toBe(true);
        expect(windowMock.matchMedia).not.toHaveBeenCalled();
    });

    it("treats standalone display mode as mobile", async () => {
        displayModeStandalone = true;

        expect((await getUserAgentPlatform()).isMobile).toBe(true);
        expect(windowMock.matchMedia).toHaveBeenCalledWith("(display-mode: standalone)");
    });

    it("falls back to the User-Agent string when the parser has no device type", async () => {
        navigatorMock.userAgent = "Custom browser on iPad";

        const platform = await getUserAgentPlatform();

        expect(platform.isMobile).toBe(true);
        expect(platform.userAgentHints?.device.type).toBeUndefined();
    });

    it("uses the parsed device type outside standalone mode", async () => {
        navigatorMock.userAgent = iPhoneUA;

        expect((await getUserAgentPlatform()).isMobile).toBe(true);
    });
});
