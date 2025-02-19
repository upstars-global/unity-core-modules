import { createPinia, setActivePinia, storeToRefs } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

import { loadLogoConfigReq } from "../../src/services/api/requests/logo";
import { useLogoStore } from "../../src/store/logoStore";
import { useRootStore } from "../../src/store/root";
import { useUserInfo } from "../../src/store/user/userInfo";

const mockLogoUrl = "mocked-logo.svg";
const mockLogoMobUrl = "mocked-logo-mob.svg";

vi.mock("@theme/images/BrandImages/logo.svg", () => ({
    default: "mocked-logo.svg",
}));
vi.mock("@theme/images/BrandImages/logo-mob.svg", () => ({
    default: "mocked-logo-mob.svg",
}));


vi.mock("../../src/store/user/userInfo", () => ({
    useUserInfo: vi.fn(() => ({
        getIsLogged: ref(false), // Используем ref() для реактивного состояния
    })),
}));

vi.mock("../../src/store/root", () => ({
    useRootStore: vi.fn(() => ({
        isMobile: ref(false), // Аналогично мок для isMobile
    })),
}));

vi.mock("../../src/services/api/requests/logo", () => ({
    loadLogoConfigReq: vi.fn(),
}));

describe("store/logoStore", () => {
    const mockLogoConfig = {
        logoUrl: {
            full: "https://example.com/full-logo.svg",
            mobile: "https://example.com/mobile-logo.svg",
        },
    };
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it("should return default logo when no config is loaded", () => {
        const store = useLogoStore();
        expect(store.getFullLogoSrc).toBe(mockLogoUrl);
        expect(store.getMobileLogoSrc).toBe(mockLogoMobUrl);
        expect(store.getLogoSrc).toBe(mockLogoUrl);
    });

    it("should load logo configuration", async () => {
        loadLogoConfigReq.mockResolvedValue(mockLogoConfig);

        const store = useLogoStore();
        await store.loadLogoConfig();

        expect(store.logoConfig).toEqual(mockLogoConfig);
        expect(store.getFullLogoSrc).toBe(mockLogoConfig.logoUrl.full);
        expect(store.getMobileLogoSrc).toBe(mockLogoConfig.logoUrl.mobile);
    });

    it("should return mobile logo when user is logged in and is on mobile", () => {
        useUserInfo.mockReturnValue({
            getIsLogged: ref(true),
        });
        useRootStore.mockReturnValue({
            isMobile: ref(true),
        });

        const store = useLogoStore();
        expect(store.getLogoSrc).toBe(mockLogoMobUrl);
    });

    it("should return full logo when user is not logged in or not on mobile", () => {
        useUserInfo.mockReturnValue({ getIsLogged: ref(false) });
        useRootStore.mockReturnValue({ isMobile: ref(true) });

        const store = useLogoStore();
        expect(store.getLogoSrc).toBe(mockLogoUrl);
    });

    it("should not call loadLogoConfigReq if logoConfig is already set", async () => {
        const store = useLogoStore();
        const { logoConfig } = storeToRefs(store);

        logoConfig.value = mockLogoConfig;

        vi.clearAllMocks();

        await store.loadLogoConfig();

        expect(loadLogoConfigReq).not.toHaveBeenCalled();

        expect(logoConfig.value).toEqual(mockLogoConfig);
    });
});
