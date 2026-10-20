import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

import type { IBannerConfig } from "../../src/models/banners";
import { useBannerStore } from "../../src/store/banners";

dayjs.extend(utc);

const showWelcomePack = ref(true);
const userGroups = ref<number[]>([]);
const isCryptoDomain = ref(false);
const isCryptoUserCurrency = ref(false);
const isLogged = ref(false);

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
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2024-01-02T00:00:00Z"));
        setActivePinia(createPinia());
        showWelcomePack.value = true;
        userGroups.value = [];
        isCryptoDomain.value = false;
        isCryptoUserCurrency.value = false;
        isLogged.value = false;
    });

    afterEach(() => {
        vi.useRealTimers();
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
                    start: "01/01/2024 00:00",
                    end: "03/01/2024 00:00",
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
                    start: "01/12/2023 00:00",
                    end: "31/12/2023 00:00",
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
                    start: "01/01/2025 00:00",
                    end: "01/02/2025 00:00",
                },
            },
        ] as never);

        expect(store.getBannersData).toEqual([]);
    });

    it("does not show banner when start time not reached  (Casino Time UTC)", () => {
        vi.setSystemTime(new Date("2026-03-17T14:02:00Z"));
        const store = useBannerStore();
        userGroups.value = [];

        store.setBanners([
            {
                id: "future-banner",
                categories: [],
                groups: [],
                liveTime: {
                    start: "17/03/2026 17:00",
                    end: "19/03/2026 01:59",
                },
            },
        ] as never);

        expect(store.getBannersData).toEqual([]);
    });

    it.each([
        [ "2026-10-01T12:00:00Z", "thu" ],
        [ "2026-10-02T12:00:00Z", "fri" ],
        [ "2026-10-03T12:00:00Z", "sat" ],
        [ "2026-10-04T12:00:00Z", "sun" ],
        [ "2026-10-05T12:00:00Z", "mon" ],
        [ "2026-10-06T12:00:00Z", "tue" ],
        [ "2026-10-07T12:00:00Z", "wed" ],
        [ "2026-10-02T00:30:00+03:00", "thu" ],
        [ "2026-10-01T23:30:00-07:00", "fri" ],
    ])("filters weekdays using UTC at %s", (date, weekday) => {
        vi.setSystemTime(new Date(date));
        const store = useBannerStore();
        const days = [ "mon", "tue", "wed", "thu", "fri", "sat", "sun" ];

        store.setBanners(days.map((day) => ({
            id: day,
            categories: [],
            liveTime: {
                start: "01/10/2026 00:01",
                end: "31/10/2026 23:59",
                days: [ day ],
            },
        })) as never);

        expect(store.getBannersData.map((banner) => banner.id)).toEqual([ weekday ]);
    });

    it.each([ undefined, null, [] ])("preserves daily display for days=%s", (days) => {
        const store = useBannerStore();
        store.setBanners([ {
            id: "daily",
            categories: [],
            liveTime: { start: "01/01/2024 00:00", end: "03/01/2024 00:00", days },
        } ] as never);

        expect(store.getBannersData.map((banner) => banner.id)).toEqual([ "daily" ]);
    });

    it.each([
        [ "2026-10-01T00:00:00Z", false ],
        [ "2026-10-01T12:00:00Z", true ],
        [ "2026-10-02T12:00:00Z", true ],
        [ "2026-10-03T12:00:00Z", false ],
        [ "2026-11-05T12:00:00Z", false ],
    ])("combines the date range and multiple weekdays at %s", (date, visible) => {
        vi.setSystemTime(new Date(date));
        const store = useBannerStore();
        store.setBanners([ {
            id: "weekly",
            categories: [],
            liveTime: {
                start: "01/10/2026 00:01",
                end: "31/10/2026 23:59",
                days: [ "thu", "fri" ],
            },
        } ] as never);

        expect(store.getBannersData.map((banner) => banner.id)).toEqual(visible ? [ "weekly" ] : []);
    });

    it.each<{ liveTime: IBannerConfig["liveTime"]; visible: boolean }>([
        { liveTime: { days: [ "mon", "fri" ] }, visible: true },
        { liveTime: { days: [ "tue" ] }, visible: false },
        { liveTime: {}, visible: true },
        { liveTime: { days: [] }, visible: true },
        { liveTime: { days: null }, visible: true },
        { liveTime: { start: "18/10/2026 00:00" }, visible: true },
        { liveTime: { start: "20/10/2026 00:00" }, visible: false },
        { liveTime: { start: "19/10/2026 00:00" }, visible: false },
        { liveTime: { end: "20/10/2026 00:00" }, visible: true },
        { liveTime: { end: "18/10/2026 00:00" }, visible: false },
        { liveTime: { end: "19/10/2026 00:00" }, visible: true },
        { liveTime: { days: [ "mon" ], start: "20/10/2026 00:00" }, visible: false },
        { liveTime: { days: [ "mon" ], end: "18/10/2026 00:00" }, visible: false },
        { liveTime: { days: [ "tue" ], start: "18/10/2026 00:00" }, visible: false },
        { liveTime: { days: [ "tue" ], end: "20/10/2026 00:00" }, visible: false },
    ])("supports optional date bounds: $liveTime", ({ liveTime, visible }) => {
        vi.setSystemTime(new Date("2026-10-19T03:00:00+03:00"));
        const store = useBannerStore();
        store.setBanners([ { id: "optional-dates", categories: [], liveTime } ] as never);

        expect(store.getBannersData.map((banner) => banner.id)).toEqual(visible ? [ "optional-dates" ] : []);
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
