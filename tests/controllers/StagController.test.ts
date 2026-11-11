import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@theme/configs/stagConsts", async () => {
    const actual = await vi.importActual<typeof import("../mocks/theme/configs/stagConsts")>("../mocks/theme/configs/stagConsts");

    return {
        ...actual,
        STAG_PARTNER_COOKIE: "partner-stag",
        AFFB_ID_COOKIE: "affb_id",
        AFFB_ID_NEW_PARTNERS: 222,
    };
});

vi.mock("../../src/helpers/ssrHelpers", () => ({
    isServer: false,
}));

vi.mock("../../src/helpers/referrerHelper", async () => {
    const actual = await vi.importActual<typeof import("../../src/helpers/referrerHelper")>(
        "../../src/helpers/referrerHelper",
    );

    return {
        ...actual,
        getAIReferrer: vi.fn(),
        getDocumentReferrer: vi.fn(),
    };
});

vi.mock("../../src/controllers/Logger", () => ({
    log: {
        error: vi.fn(),
    },
}));

vi.mock("../../src/services/common", () => ({
    loadStagByReferName: vi.fn().mockResolvedValue(undefined),
}));

import { DEFAULT_STAGS_COUNTRY_REFER, REFERRER } from "@theme/configs/stagConsts";

import { CookieController } from "../../src/controllers/CookieController";
import { StagController } from "../../src/controllers/StagController";
import { getAIReferrer, getDocumentReferrer } from "../../src/helpers/referrerHelper";
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

    it.each([
        "https://www.thailand-travel.com/",
        "https://dubai-guide.com/",
        "https://mail.example.com/",
        "https://example.com/?q=ai&utm=ai",
        "https://perplexity.ai/",
        "https://ai.example.com/",
    ])("should not treat '%s' as AI referrer", (referrer) => {
        const result = StagController.getStagByReferrerName({
            referrer,
            stagsByReferName: undefined,
            path: "/test-path",
            country: "CA",
        });

        expect(result).toBe("");
    });

    it.each([
        "https://example.com/?q=google",
        "https://example.com/bing-review",
    ])("should ignore path and query of '%s'", (referrer) => {
        const result = StagController.getStagByReferrerName({
            referrer,
            stagsByReferName: undefined,
            path: "/test-path",
            country: "CA",
        });

        expect(result).toBe("");
    });

    it.each([
        [ "https://www.google.co.uk/", REFERRER.GOOGLE ],
        [ "https://search.yahoo.com/search?p=test", REFERRER.YAHOO ],
        [ "https://www.bing.com/", REFERRER.BING ],
    ])("should match search engine by hostname of '%s'", (referrer, engine) => {
        const result = StagController.getStagByReferrerName({
            referrer,
            stagsByReferName: undefined,
            path: "/test-path",
            country: "CA",
        });

        expect(result).toBe(DEFAULT_STAGS_COUNTRY_REFER[COUNTRIES.CANADA][engine]);
    });

    it("should return empty string for referrer that is not a valid URL and has no search engine", () => {
        const result = StagController.getStagByReferrerName({
            referrer: "not a url",
            stagsByReferName: undefined,
            path: "/test-path",
            country: "CA",
        });

        expect(result).toBe("");
    });

    it("should match search engine in referrer without protocol", () => {
        const result = StagController.getStagByReferrerName({
            referrer: "www.google.com",
            stagsByReferName: undefined,
            path: "/test-path",
            country: "CA",
        });

        expect(result).toBe(DEFAULT_STAGS_COUNTRY_REFER[COUNTRIES.CANADA][REFERRER.GOOGLE]);
    });
});

describe("StagController.init affb_id", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal("window", { location: { href: "https://site.test/page" } });
        vi.spyOn(CookieController, "get").mockImplementation((name: string) => {
            // existing stag skips initStag, so only initAffbId is exercised
            return name === "partner-stag" ? "existing-stag_1" : undefined;
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it.each([
        [ "", 111 ],
        [ "https://www.thailand-travel.com/", 111 ],
        [ "https://www.google.com/search?q=test", 222 ],
    ])("should set affb_id for referrer '%s' without throwing", (referrer, affbId) => {
        vi.mocked(getAIReferrer).mockReturnValue(undefined);
        vi.mocked(getDocumentReferrer).mockReturnValue(referrer);
        const setSpy = vi.spyOn(CookieController, "set").mockImplementation(() => undefined);

        expect(() => StagController.init()).not.toThrow();
        expect(setSpy).toHaveBeenCalledWith("affb_id", affbId, { expires: 30 * 86400, path: "/" });
    });

    it("should set new partners affb_id for AI traffic", () => {
        vi.mocked(getAIReferrer).mockReturnValue("chatgpt");
        vi.mocked(getDocumentReferrer).mockReturnValue("https://www.thailand-travel.com/");
        const setSpy = vi.spyOn(CookieController, "set").mockImplementation(() => undefined);

        StagController.init();

        expect(setSpy).toHaveBeenCalledWith("affb_id", 222, { expires: 30 * 86400, path: "/" });
    });
});

describe("StagController.init stag", () => {
    const flushPromises = () => new Promise((resolve) => setTimeout(resolve));

    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal("window", { location: { href: "https://site.test/page" } });
        // no stag and affb_id cookies yet
        vi.spyOn(CookieController, "get").mockReturnValue(undefined);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it("should set AI stag when getAIReferrer detects AI traffic", async () => {
        vi.mocked(getAIReferrer).mockReturnValue("chatgpt");
        vi.mocked(getDocumentReferrer).mockReturnValue("https://chatgpt.com/");
        const setSpy = vi.spyOn(CookieController, "set").mockImplementation(() => undefined);

        StagController.init();
        await flushPromises();

        expect(setSpy).toHaveBeenCalledWith("partner-stag", DEFAULT_STAGS_COUNTRY_REFER.others[REFERRER.AI], {
            expires: 30 * 86400,
            path: "/",
        });
    });

    it("should set search engine stag by referrer hostname", async () => {
        vi.mocked(getAIReferrer).mockReturnValue(undefined);
        vi.mocked(getDocumentReferrer).mockReturnValue("https://www.google.com/search?q=test");
        const setSpy = vi.spyOn(CookieController, "set").mockImplementation(() => undefined);

        StagController.init();
        await flushPromises();

        expect(setSpy).toHaveBeenCalledWith("partner-stag", DEFAULT_STAGS_COUNTRY_REFER.others[REFERRER.GOOGLE], {
            expires: 30 * 86400,
            path: "/",
        });
    });

    it.each([
        "https://www.thailand-travel.com/",
        "https://mail.example.com/?utm_source=ai",
    ])("should not set stag for non AI referrer '%s' containing 'ai'", async (referrer) => {
        vi.mocked(getAIReferrer).mockReturnValue(undefined);
        vi.mocked(getDocumentReferrer).mockReturnValue(referrer);
        const setSpy = vi.spyOn(CookieController, "set").mockImplementation(() => undefined);

        StagController.init();
        await flushPromises();

        expect(setSpy).not.toHaveBeenCalledWith("partner-stag", expect.anything(), expect.anything());
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
