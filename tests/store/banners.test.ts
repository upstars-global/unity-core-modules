import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

import { useBannerStore } from "../../src/store/banners";

const showWelcomePack = ref(true);
const userGroups = ref<number[]>([]);
const isCryptoDomain = ref(false);
const isCryptoUserCurrency = ref(false);
const isLogged = ref(false);

const nowMs = Date.parse("2024-01-02T00:00:00Z");
const makeDay = (ms: number) => ({
    __ms: ms,
    isAfter(other: { __ms: number }) {
        return ms > other.__ms;
    },
    utc() {
        return this;
    },
});

vi.mock("dayjs", () => {
    const dayjs = (input?: string) => makeDay(input ? Date.parse(input) : nowMs);
    dayjs.utc = () => makeDay(nowMs);
    dayjs.extend = vi.fn();
    return { default: dayjs };
});

vi.mock("dayjs/plugin/customParseFormat", () => ({
    default: {},
}));

vi.mock("@config/banners", () => ({
    BANNER_CATEGORY_131811__HIDE: "welcome_hide",
    BANNER_CATEGORY_131811_SHOW: "welcome_show",
    BANNER_CATEGORY_JACKPOTS: "jackpots",
    shouldDisplayRegistrationBanner: vi.fn(() => (banner) => banner.id !== "reg-excluded"),
}));

vi.mock("../../src/controllers/useWelcomePack", () => ({
    useWelcomePack: () => ({
        showWelcomePack,
    }),
}));

vi.mock("../../src/helpers/jackpotsHelpers", () => ({
    prepareJackpotsBanners: vi.fn((banner) => ({
        ...banner,
        prepared: true,
    })),
}));

vi.mock("../../src/store/user/userInfo", () => ({
    useUserInfo: () => ({
        getIsLogged: isLogged,
        isCryptoUserCurrency,
    }),
}));

vi.mock("../../src/store/user/userStatuses", () => ({
    useUserStatuses: () => ({
        getUserGroups: userGroups,
    }),
}));

vi.mock("../../src/store/settings", () => ({
    useSettings: () => ({
        isCryptoDomain,
    }),
}));

describe("useBannerStore", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        showWelcomePack.value = true;
        userGroups.value = [];
        isCryptoDomain.value = false;
        isCryptoUserCurrency.value = false;
        isLogged.value = false;
    });

    it("filters banners by welcome pack, groups, live time, and registration logic", () => {
        const store = useBannerStore();
        userGroups.value = [ 2 ];

        store.setBanners([
            {
                id: "welcome-show",
                categories: [ "welcome_show", "jackpots" ],
                groups: [ 2 ],
                liveTime: {
                    start: "2024-01-01T00:00:00Z",
                    end: "2024-01-03T00:00:00Z",
                },
            },
            {
                id: "welcome-hide",
                categories: [ "welcome_hide" ],
                groups: [ 2 ],
            },
            {
                id: "group-miss",
                categories: [],
                groups: [ 9 ],
            },
            {
                id: "time-expired",
                categories: [],
                liveTime: {
                    start: "2023-12-01T00:00:00Z",
                    end: "2023-12-31T00:00:00Z",
                },
            },
            {
                id: "reg-excluded",
                categories: [],
            },
        ] as never);

        expect(store.getBannersData).toEqual([
            expect.objectContaining({
                id: "welcome-show",
                prepared: true,
            }),
        ]);
    });

    it("hides welcome pack show banners when welcome pack is disabled", () => {
        const store = useBannerStore();
        showWelcomePack.value = false;

        store.setBanners([
            { id: "welcome-show", categories: [ "welcome_show" ] },
            { id: "regular", categories: [ "other" ] },
        ] as never);

        expect(store.getBannersData.map((item) => item.id)).toEqual([ "regular" ]);
    });

    it("filters out banners that are not started yet", () => {
        const store = useBannerStore();
        userGroups.value = [ 2 ];

        store.setBanners([
            {
                id: "future",
                categories: [],
                groups: [ 2 ],
                liveTime: {
                    start: "2025-01-01T00:00:00Z",
                    end: "2025-02-01T00:00:00Z",
                },
            },
        ] as never);

        expect(store.getBannersData).toEqual([]);
    });

    it("manages terms files and viewed banners", () => {
        const store = useBannerStore();

        store.setTermsFiles([ { id: "file-1" } ] as never);
        store.setViewedGTMBanners({ id: "view-1" } as never);

        expect(store.termsFiles).toEqual([ { id: "file-1" } ]);
        expect(store.viewedGTMBanners).toEqual([ { id: "view-1" } ]);

        store.clearViewedGTMBanners();
        expect(store.viewedGTMBanners).toEqual([]);
    });
});
