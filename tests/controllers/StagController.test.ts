/* eslint-disable @stylistic/js/max-len */
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@theme/configs/stagConsts", async () => {
    const actual = await vi.importActual<typeof import("../mocks/theme/configs/stagConsts")>("../mocks/theme/configs/stagConsts");

    return {
        ...actual,
        STAG_PARTNER_COOKIE: "partner-stag",
    };
});

import { DEFAULT_STAGS_COUNTRY_REFER, REFERRER } from "@theme/configs/stagConsts";

import { CookieController } from "../../src/controllers/CookieController";
import { StagController } from "../../src/controllers/StagController";
import { COUNTRIES } from "../mocks/theme/configs/constsLocales";

describe("StagController.getStagByReferrerName function", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return empty string if stagsByReferName.pages and stagsByReferName.countries are null", () => {
        const referrer = "https://google.com";
        const stagsByReferName = { pages: null, countries: null };
        const result = StagController.getStagByReferrerName({
            referrer,
            stagsByReferName,
            path: "/test-path",
            country: "CA",
        });
        expect(result).toBe("");
    });

    it("should return default 'stagsByReferName.country + search engine' string if stagsByReferName are undefined", () => {
        const referrer = "https://google.com";
        const result = StagController.getStagByReferrerName({
            referrer,
            stagsByReferName: undefined,
            path: "/test-path",
            country: "CA",
        });
        expect(result).toBe(DEFAULT_STAGS_COUNTRY_REFER[COUNTRIES.CANADA][REFERRER.GOOGLE]);
    });

    it("should return default 'stagsByReferName.others + search engine' string if stagsByReferName are undefined", () => {
        const referrer = "https://google.com";
        const result = StagController.getStagByReferrerName({
            referrer,
            stagsByReferName: undefined,
            path: "/test-path",
            country: "US",
        });
        expect(result).toBe(DEFAULT_STAGS_COUNTRY_REFER.others[REFERRER.GOOGLE]);
    });

    it("should return 'test-stag-page' if referrer contains fully match in 'stagsByReferName.pages + search engine'", () => {
        const referrer = "https://google.com";
        const stagsByReferName = {
            pages: {
                [REFERRER.GOOGLE]: {
                    "/test-path": "test-stag-page",
                },
            },
            countries: {
                CA: {
                    [REFERRER.GOOGLE]: "test-stag-country",
                },
                others: {
                    [REFERRER.GOOGLE]: "test-stag-others",
                },
            },
        };
        const result = StagController.getStagByReferrerName({
            referrer,
            stagsByReferName,
            path: "/test-path",
            country: "CA",
        });
        expect(result).toBe("test-stag-page");
    });

    it("should return 'test-stag-country' if referrer contains partial match in 'stagsByReferName.pages + search engine' and fully match in 'stagsByReferName.countries + search engine'", () => {
        const referrer = "https://yahoo.com";
        const stagsByReferName = {
            pages: {
                [REFERRER.GOOGLE]: {
                    "/test-path": "test-stag-page",
                },
            },
            countries: {
                CA: {
                    [REFERRER.YAHOO]: "test-stag-country",
                },
                others: {
                    [REFERRER.BING]: "test-stag-others",
                },
            },
        };
        const result = StagController.getStagByReferrerName({
            referrer,
            stagsByReferName,
            path: "/test-path",
            country: "CA",
        });
        expect(result).toBe("test-stag-country");
    });

    it("should return 'test-stag-others' if referrer contains partial match in 'stagsByReferName.pages + search engine && stagsByReferName.countries + search engine' and fully match in 'stagsByReferName.others + search engine'", () => {
        const referrer = "https://bing.com";
        const stagsByReferName = {
            pages: {
                [REFERRER.GOOGLE]: {
                    "/test-path": "test-stag-page",
                },
            },
            countries: {
                CA: {
                    [REFERRER.YAHOO]: "test-stag-country",
                },
                others: {
                    [REFERRER.BING]: "test-stag-others",
                },
            },
        };
        const result = StagController.getStagByReferrerName({
            referrer,
            stagsByReferName,
            path: "/test-path",
            country: "CA",
        });
        expect(result).toBe("test-stag-others");
    });

    it("should handle 'ai' referrer correctly", () => {
        const referrer = "ai";
        const stagsByReferName = {
            pages: {
                [REFERRER.GOOGLE]: {
                    "/test-path": "test-stag-page",
                },
                ai: {
                    "/test-path": "test-stag-ai-page",
                },
            },
            countries: {
                CA: {
                    [REFERRER.GOOGLE]: "test-stag-country",
                    ai: "test-stag-ai-country",
                },
                others: {
                    [REFERRER.BING]: "test-stag-others",
                    ai: "test-stag-ai-others",
                },
            },
        };

        const result = StagController.getStagByReferrerName({
            referrer,
            stagsByReferName,
            path: "/test-path",
            country: "CA",
        });

        expect(result).toBe("test-stag-ai-page");
    });
});

describe("StagController cookies", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("setStag stores both stag and hold cookies", () => {
        const setSpy = vi.spyOn(CookieController, "set").mockImplementation(() => undefined);

        StagController.setStag("test-stag_123");

        expect(setSpy).toHaveBeenNthCalledWith(1, "partner-stag", "test-stag_123", {
            expires: 30 * 86400,
            path: "/",
        });
        expect(setSpy).toHaveBeenNthCalledWith(2, "partner-stag-hold", "test-stag_123", {
            expires: 8 * 3600,
            path: "/",
        });
    });

    it("getStagHold reads hold cookie value", () => {
        vi.spyOn(CookieController, "get").mockImplementation((name: string) => {
            if (name === "partner-stag-hold") {
                return "test-stag_123";
            }

            return undefined;
        });

        expect(StagController.getStagHold()).toBe("test-stag_123");
    });
});
