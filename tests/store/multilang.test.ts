import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getLocale } from "../../src/helpers/localeInCookies";
import { useMultilangStore } from "../../src/store/multilang";

vi.mock("../../src/helpers/localeInCookies", () => ({
    getLocale: vi.fn(),
}));

describe("useMultilangStore", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    it("initialization with default values", () => {
        const store = useMultilangStore();

        expect(store.locales).toEqual([]);
        expect(store.locale).toBe("");
        expect(store.geo).toBe("");
        expect(store.country).toBe("");
        expect(store.getUserLocale).toBe(store.getDefaultLang); // cookie not set → default
    });

    it("setLocale should change locale", () => {
        const store = useMultilangStore();

        store.setLocale("en");
        expect(store.locale).toBe("en");
    });

    it("setLocales should change list of locales", () => {
        const store = useMultilangStore();
        const locales = [
            { code: "en", name: "English", name_in_locale: "English", default: true },
            { code: "de", name: "Deutsch", name_in_locale: "Deutsch", default: false },
            { code: "fr", name: "Français", name_in_locale: "Français", default: false },
        ];

        store.setLocales(locales);
        expect(store.locales).toEqual(locales);
    });

    it("setDefaultParams should change defaultCountry and defaultLocaleByCountry", () => {
        const store = useMultilangStore();

        store.setDefaultParams({
            defaultCountry: "DE",
            defaultLocaleByCountry: {
                DE: "de",
                default: "en",
            },
        });

        expect(store.getUserGeo).toBe("DE");
        expect(store.getDefaultLang).toBe("en");
    });

    it("getDefaultLang should return locale by country", () => {
        const store = useMultilangStore();

        store.setDefaultParams({
            defaultCountry: "DE",
            defaultLocaleByCountry: {
                DE: "de",
                default: "en",
            },
        });
        store.country = "DE";

        expect(store.getDefaultLang).toBe("de");
    });

    it("getDefaultLang should return default if country not found", () => {
        const store = useMultilangStore();

        store.setDefaultParams({
            defaultCountry: "FR",
            defaultLocaleByCountry: {
                DE: "de",
                default: "en",
            },
        });
        store.country = "IT";

        expect(store.getDefaultLang).toBe("en");
    });

    it("getUserGeo should return geo if it exists", () => {
        const store = useMultilangStore();

        store.setDefaultParams({
            defaultCountry: "FR",
            defaultLocaleByCountry: {
                default: "en",
            },
        });

        expect(store.getUserGeo).toBe("FR");

        store.geo = "DE";
        expect(store.getUserGeo).toBe("DE");
    });

    // ==== Tests with getLocale mocks ====

    it("getUserLocale takes locale from cookie if it exists", () => {
        const store = useMultilangStore();
        getLocale.mockReturnValue("fr");

        expect(store.getUserLocale).toBe("fr");
    });

    it("if cookie not set, takes locale from store", () => {
        const store = useMultilangStore();
        getLocale.mockReturnValue(undefined);

        store.setLocale("de");
        expect(store.getUserLocale).toBe("de");
    });

    it("if cookie and locale empty, takes getDefaultLang", () => {
        const store = useMultilangStore();
        getLocale.mockReturnValue(undefined);

        store.setDefaultParams({
            defaultCountry: "IT",
            defaultLocaleByCountry: {
                IT: "it",
                default: "en",
            },
        });
        expect(store.getUserLocale).toBe("en");
    });
});
