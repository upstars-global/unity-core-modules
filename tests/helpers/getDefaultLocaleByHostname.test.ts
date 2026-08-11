import { afterEach, describe, expect, it, vi } from "vitest";

const { defaultLocaleByCountry } = vi.hoisted(() => ({
    defaultLocaleByCountry: {
        DE: "de",
        GB: "en",
        default: "en",
    } as Record<string, string>,
}));

vi.mock("@theme/configs/constsLocales", () => ({
    COUNTRY_BY_HOST: {
        "example.de": "DE",
    },
    DEFAULT_COUNTRY: "GB",
    DEFAULT_LOCALE_BY_COUNTRY: defaultLocaleByCountry,
}));

import { getDefaultLocaleByHostname } from "../../src/helpers/getDefaultLocaleByHostname";

describe("getDefaultLocaleByHostname", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        defaultLocaleByCountry.GB = "en";
    });

    it("returns the locale configured for the hostname country", () => {
        vi.stubGlobal("window", { location: { hostname: "example.de" } });

        expect(getDefaultLocaleByHostname()).toBe("de");
    });

    it("falls back to the default country locale for an unknown hostname", () => {
        vi.stubGlobal("window", { location: { hostname: "unknown.example" } });

        expect(getDefaultLocaleByHostname()).toBe("en");
    });

    it("falls back to the default locale when the default country has no locale", () => {
        vi.stubGlobal("window", { location: { hostname: "unknown.example" } });
        delete defaultLocaleByCountry.GB;

        expect(getDefaultLocaleByHostname()).toBe("en");
    });
});
