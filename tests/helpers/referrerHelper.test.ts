import { beforeEach, describe, expect, it, vi } from "vitest";

import { CookieController } from "../../src/controllers/CookieController";
import { getAIReferrer, getDocumentReferrer, getReferrerHostname } from "../../src/helpers/referrerHelper";
import { REFERRER_COOKIE_NAME } from "../mocks/theme/configs/constsCookies";

vi.mock("../../src/helpers/ssrHelpers", () => ({
    isServer: false,
}));

vi.mock("../../src/controllers/CookieController", () => ({
    CookieController: {
        get: vi.fn(),
    },
}));

describe("getDocumentReferrer", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal("document", {
            referrer: "",
        });
    });

    it("returns document.referrer if exists", () => {
        Object.defineProperty(document, "referrer", {
            value: "https://chatgpt.com",
            configurable: true,
        });
        const result = getDocumentReferrer();

        expect(result).toBe("https://chatgpt.com");
    });

    it("returns cookie referrer if document.referrer empty", () => {
        Object.defineProperty(document, "referrer", {
            value: "",
            configurable: true,
        });

        CookieController.get.mockReturnValue("https://perplexity.ai");
        const result = getDocumentReferrer();

        expect(CookieController.get).toHaveBeenCalledWith(REFERRER_COOKIE_NAME);
        expect(result).toBe("https://perplexity.ai");
    });
});

describe("getReferrerHostname", () => {
    it("returns hostname without path and query", () => {
        expect(getReferrerHostname("https://www.google.com/search?q=test#top")).toBe("www.google.com");
    });

    it.each([
        "",
        "www.google.com",
        "not a url",
    ])("returns '%s' as is if it is not a valid URL", (referrer) => {
        expect(getReferrerHostname(referrer)).toBe(referrer);
    });
});

describe("getAIReferrer", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal("document", {
            referrer: "",
        });
    });

    it("returns utm_source if it matches AI regex", () => {
        const params = new URLSearchParams({
            utm_source: "chatgpt",
        });
        const result = getAIReferrer(params);

        expect(result).toBe("chatgpt");
    });

    it("returns utm_source with domain", () => {
        const params = new URLSearchParams({
            utm_source: "openai.com",
        });
        const result = getAIReferrer(params);

        expect(result).toBe("openai.com");
    });

    it("returns referrer match if utm_source not present", () => {
        Object.defineProperty(document, "referrer", {
            value: "https://chat.openai.com/some/page",
            configurable: true,
        });

        const params = new URLSearchParams();
        const result = getAIReferrer(params);

        expect(result).toBe("chat.openai.com");
    });

    it("returns undefined if nothing matches", () => {
        Object.defineProperty(document, "referrer", {
            value: "https://google.com",
            configurable: true,
        });

        const params = new URLSearchParams();
        const result = getAIReferrer(params);

        expect(result).toBeUndefined();
    });
});
