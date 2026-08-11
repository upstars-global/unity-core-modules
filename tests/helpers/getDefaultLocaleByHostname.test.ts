import { afterEach, describe, expect, it, vi } from "vitest";

const { defaultLocaleByCountry } = vi.hoisted(() => ({
    defaultLocaleByCountry: {
        DE: "de",
        default: "en",
    } as Record<string, string>,
}));

vi.mock("@theme/configs/constsLocales", () => ({
    COUNTRY_BY_HOST: {
        "example.de": "DE",
    },
    DEFAULT_LOCALE_BY_COUNTRY: defaultLocaleByCountry,
}));

import { getDefaultLocaleByHostname } from "../../src/helpers/getDefaultLocaleByHostname";

describe("getDefaultLocaleByHostname", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("returns the locale configured for the hostname country", () => {
        vi.stubGlobal("window", { location: { hostname: "example.de" } });

        expect(getDefaultLocaleByHostname()).toBe("de");
    });

    it("falls back to the default locale for an unknown hostname", () => {
        vi.stubGlobal("window", { location: { hostname: "unknown.example" } });

        expect(getDefaultLocaleByHostname()).toBe("en");
    });
});
