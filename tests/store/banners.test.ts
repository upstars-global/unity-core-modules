import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

import { useBannerStore } from "../../src/store/banners";

const showWelcomePack = ref(true);
const userGroups = ref<number[]>([]);
const isCryptoDomain = ref(false);
const isCryptoUserCurrency = ref(false);
const isLogged = ref(false);

const nowMs = Date.parse("2024-01-02T00:00:00Z");

function parseDDMMYYYYHHmm(str: string): number {
    const match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})$/);
    if (!match) {
        return Date.parse(str);
    }
    const [ , day, month, year, hour, minute ] = match;
    return Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
}

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
    dayjs.utc = (dateStr?: string, _format?: string) =>
        makeDay(dateStr ? parseDDMMYYYYHHmm(dateStr) : Date.now());
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

    it("does not show banner when start time not reached (Casino Time UTC)", () => {
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
