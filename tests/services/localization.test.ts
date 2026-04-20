import { beforeEach, describe, expect, it, vi } from "vitest";

const loadLocalesReqMock = vi.fn();
const updateLocalesReqMock = vi.fn();
const getUrlSearchParamsMock = vi.fn();
const getStagMock = vi.fn();
const getStagHoldMock = vi.fn();
const getAffbIdMock = vi.fn();
const setStagMock = vi.fn();
const setLocalesMock = vi.fn();
const setLocaleMock = vi.fn();

vi.mock("../../src/services/api/requests/multilang", () => ({
    loadLocalesReq: loadLocalesReqMock,
    updateLocalesReq: updateLocalesReqMock,
}));

vi.mock("../../src/helpers/urlHelpers", () => ({
    getUrlSearchParams: getUrlSearchParamsMock,
}));

vi.mock("../../src/controllers/StagController", () => ({
    StagController: {
        getAffbId: getAffbIdMock,
        getStag: getStagMock,
        getStagHold: getStagHoldMock,
        setStag: setStagMock,
    },
}));

vi.mock("../../src/store/multilang", () => ({
    useMultilangStore: vi.fn(() => ({
        getUserLocale: "",
        getDefaultLang: "en",
        locales: [],
        setLocales: setLocalesMock,
        setLocale: setLocaleMock,
    })),
}));

const configStoreState = {
    $defaultProjectConfig: {
        referralStag: "224448_69d4c6b3e69e08fffd0bb573",
    },
};

vi.mock("../../src/store/configStore", () => ({
    useConfigStore: vi.fn(() => configStoreState),
}));

describe("localization service referral stag handling", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        configStoreState.$defaultProjectConfig.referralStag = "224448_69d4c6b3e69e08fffd0bb573";

        getUrlSearchParamsMock.mockReturnValue(new URLSearchParams());
        getAffbIdMock.mockReturnValue(undefined);
        getStagMock.mockReturnValue(undefined);
        getStagHoldMock.mockReturnValue(undefined);
        loadLocalesReqMock.mockResolvedValue([]);
    });

    it("sets referral stag when ref_code exists and stag is missing", async () => {
        getUrlSearchParamsMock.mockReturnValue(new URLSearchParams("ref_code=ref123"));
        getStagMock
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce("224448_69d4c6b3e69e08fffd0bb573");

        const { loadLocales } = await import("../../src/services/localization");

        await loadLocales();

        expect(setStagMock).toHaveBeenCalledWith("224448_69d4c6b3e69e08fffd0bb573");
        expect(loadLocalesReqMock).toHaveBeenCalledWith("ref_code=ref123&partner-stag=224448_69d4c6b3e69e08fffd0bb573");
    });

    it("keeps existing stag when hold cookie exists", async () => {
        getUrlSearchParamsMock.mockReturnValue(new URLSearchParams("ref_code=ref123"));
        getStagMock.mockReturnValue("existing_stag");
        getStagHoldMock.mockReturnValue("existing_stag");

        const { loadLocales } = await import("../../src/services/localization");

        await loadLocales();

        expect(setStagMock).not.toHaveBeenCalled();
        expect(loadLocalesReqMock).toHaveBeenCalledWith("ref_code=ref123&partner-stag=existing_stag");
    });

    it("replaces existing stag when hold cookie is missing", async () => {
        getUrlSearchParamsMock.mockReturnValue(new URLSearchParams("ref_code=ref123"));
        getStagMock
            .mockReturnValueOnce("old_stag")
            .mockReturnValueOnce("224448_69d4c6b3e69e08fffd0bb573");
        getStagHoldMock.mockReturnValue(undefined);

        const { loadLocales } = await import("../../src/services/localization");

        await loadLocales();

        expect(setStagMock).toHaveBeenCalledWith("224448_69d4c6b3e69e08fffd0bb573");
        expect(loadLocalesReqMock).toHaveBeenCalledWith("ref_code=ref123&partner-stag=224448_69d4c6b3e69e08fffd0bb573");
    });

    it("does not set referral stag when project config has no referralStag", async () => {
        configStoreState.$defaultProjectConfig.referralStag = undefined;
        getUrlSearchParamsMock.mockReturnValue(new URLSearchParams("ref_code=ref123"));
        getStagMock.mockReturnValue("old_stag");
        getStagHoldMock.mockReturnValue(undefined);

        const { loadLocales } = await import("../../src/services/localization");

        await loadLocales();

        expect(setStagMock).not.toHaveBeenCalled();
        expect(loadLocalesReqMock).toHaveBeenCalledWith("ref_code=ref123&partner-stag=old_stag");
    });

    it("includes affb_id together with actual stag", async () => {
        getUrlSearchParamsMock.mockReturnValue(new URLSearchParams("ref_code=ref123"));
        getAffbIdMock.mockReturnValue("777");
        getStagMock.mockReturnValue("existing_stag");
        getStagHoldMock.mockReturnValue("existing_stag");

        const { loadLocales } = await import("../../src/services/localization");

        await loadLocales();

        expect(loadLocalesReqMock).toHaveBeenCalledWith("ref_code=ref123&affb_id=777&partner-stag=existing_stag");
    });
});
