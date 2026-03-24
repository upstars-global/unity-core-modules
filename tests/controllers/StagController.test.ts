/* eslint-disable @stylistic/js/max-len */
import { beforeEach, describe, expect, it, vi } from "vitest";

import { StagController } from "../../src/controllers/StagController";
import { COUNTRIES } from "../mocks/theme/configs/constsLocales";
import { DEFAULT_STAGS_COUNTRY_REFER, REFERRER } from "../mocks/theme/configs/stagConsts";

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
