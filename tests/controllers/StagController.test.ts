import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

import { CookieController } from "../../src/controllers/CookieController";
import { StagController } from "../../src/controllers/StagController";
import { getAIReferrer, getDocumentReferrer } from "../../src/helpers/referrerHelper";
import { loadStagByReferName } from "../../src/services/common";

vi.mock("@/controllers/CookieController", () => ({
    CookieController: {
        get: vi.fn(),
        set: vi.fn(),
    },
}));

vi.mock("@/services/common", () => ({
    loadStagByReferName: vi.fn(),
}));

vi.mock("@/helpers/referrerHelper", () => ({
    getAIReferrer: vi.fn(),
    getDocumentReferrer: vi.fn(),
}));

vi.mock("@/helpers/ssrHelpers", () => ({
    isServer: false,
}));

vi.mock("pinia", () => ({
    storeToRefs: () => ({
        getUserGeo: ref("canada"),
    }),
}));

vi.mock("@/store/multilang", () => ({
    useMultilangStore: () => ({}),
}));

vi.mock("@/controllers/Logger", () => ({
    log: {
        error: vi.fn(),
    },
}));

describe("StagController", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getStagInfo", () => {
        it("returns parsed stag info", () => {
            (CookieController.get).mockReturnValue("12345_1");

            const result = StagController.getStagInfo();

            expect(result).toEqual({
                stagId: "12345",
                stagVisit: "1",
            });
        });

        it("returns null if no stag", () => {
            (CookieController.get).mockReturnValue(undefined);

            const result = StagController.getStagInfo();

            expect(result).toBeNull();
        });
    });

    describe("getStagByReferrerName", () => {
        const stagsConfig = {
            pages: {
                google: {
                    "/": "google_stag",
                },
            },
            countries: {
                canada: {
                    google: "geo_google_stag",
                },
                others: {
                    google: "others_google_stag",
                },
            },
        };

        it("returns stag by path", () => {
            const result = StagController.getStagByReferrerName({
                referrer: "google.com",
                path: "/",
                country: "CA",
                stagsByReferName: stagsConfig,
            });

            expect(result).toBe("google_stag");
        });

        it("returns stag by geo if path missing", () => {
            const result = StagController.getStagByReferrerName({
                referrer: "google.com",
                path: "/unknown",
                country: "CA",
                stagsByReferName: stagsConfig,
            });

            expect(result).toBe("geo_google_stag");
        });

        it("returns empty string if no referrer match", () => {
            const result = StagController.getStagByReferrerName({
                referrer: "unknown.com",
                path: "/",
                country: "CA",
                stagsByReferName: stagsConfig,
            });

            expect(result).toBe("");
        });
    });

    describe("init", () => {
        it("sets affb_id from query", async () => {
            (CookieController.get).mockReturnValue(undefined);

            Object.defineProperty(window, "location", {
                value: new URL("https://site.com/?affb_id=999"),
            });

            (getAIReferrer).mockReturnValue(undefined);
            (getDocumentReferrer).mockReturnValue("");

            StagController.init();

            expect(CookieController.set).toHaveBeenCalled();
        });

        it("sets stag from query", async () => {
            (CookieController.get).mockReturnValue(undefined);

            Object.defineProperty(window, "location", {
                value: new URL("https://site.com/?stag=777"),
            });

            (getAIReferrer).mockReturnValue(undefined);
            (getDocumentReferrer).mockReturnValue("");

            StagController.init();

            expect(CookieController.set).toHaveBeenCalled();
        });

        it("loads stag from referrer config", async () => {
            (CookieController.get).mockReturnValue(undefined);

            (loadStagByReferName).mockResolvedValue({
                pages: {},
                countries: {
                    canada: {
                        google: "stag_google",
                    },
                },
            });

            Object.defineProperty(window, "location", {
                value: new URL("https://site.com/"),
            });

            (getAIReferrer).mockReturnValue(undefined);
            (getDocumentReferrer).mockReturnValue("google.com");

            StagController.init();

            expect(loadStagByReferName).toHaveBeenCalled();
            expect(CookieController.set).toHaveBeenCalled();
        });

        it("uses 'ai' referrer when AI referrer detected", async () => {
            (CookieController.get).mockReturnValue(undefined);

            Object.defineProperty(window, "location", {
                value: new URL("https://chatgpt.com/"),
            });

            (getAIReferrer).mockReturnValue("chatgpt.com");
            (getDocumentReferrer).mockReturnValue("chatgpt.com");

            (loadStagByReferName).mockResolvedValue({
                pages: {},
                countries: {
                    CA: {
                        ai: "stag_ai",
                    },
                },
            });

            StagController.init();

            expect(getAIReferrer).toHaveBeenCalled();
            expect(getDocumentReferrer).not.toHaveBeenCalled();

            expect(CookieController.set).toHaveBeenCalled();
        });
    });
});
