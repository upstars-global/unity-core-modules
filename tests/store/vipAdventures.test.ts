import { formatDateVipAdv, VIP_ADV_GROUP } from "@config/vip-adventures";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import weekday from "dayjs/plugin/weekday";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { IPrizeConfigItem } from "../../src/services/api/DTO/vipAdventuresDTO";
import {
    parseAdventuresTitleDayConfig,
    parseGiftAdventureTitle,
    useVipAdventures,
} from "../../src/store/user/vipAdventures";


dayjs.extend(weekday);
dayjs.extend(utc);


vi.mock("@config/vip-adventures", () => ({
    VIP_ADV_GROUP: "vip_adv_group",
    formatDateVipAdv: "YYYY-MM-DD",
}));

vi.mock("../../src/store/environments", () => ({
    useEnvironments: () => ({
        useMocker: false,
    }),
}));

const mockUserStatuses = {
    getUserStatuses: [] as { name: string }[],
    getUserGroups: [] as string[],
};

vi.mock("../../src/store/user/userStatuses", () => ({
    useUserStatuses: () => mockUserStatuses,
}));


describe("vipAdventures helpers", () => {
    it("parseAdventuresTitleDayConfig parses title correctly", () => {
        expect(
            parseAdventuresTitleDayConfig("__1/5__2024-01-10"),
        ).toEqual({
            day: "2024-01-10",
            step: 1,
            stepTotal: 5,
        });
    });

    it("parseGiftAdventureTitle parses gift title", () => {
        expect(
            parseGiftAdventureTitle("__3__2024-01-10__Super Gift"),
        ).toEqual({
            step: 3,
            day: "2024-01-10",
            giftTitle: "Super Gift",
        });
    });
});


describe("useVipAdventures store", () => {
    beforeEach(() => {
        setActivePinia(createPinia());

        mockUserStatuses.getUserStatuses = [];
        mockUserStatuses.getUserGroups = [];
    });

    it("returns empty values when config is not set", () => {
        const store = useVipAdventures();

        expect(store.vipAdventuresDays).toEqual([]);
        expect(store.calendarConfig).toEqual([]);
        expect(store.superDay).toBeUndefined();
    });

    it("builds vipAdventuresDays with correct typing", () => {
        const store = useVipAdventures();

        const config: IPrizeConfigItem[] = [
            {
                title: "__1/3__2024-01-01",
                prize: {
                    bonus: "100",
                },
                condition: {
                    minDep: "0",
                    wager: "1",
                    periodActivationDays: "7",
                },
            },
            {
                title: "__2/3__2024-01-02",
                prize: {
                    freespin: 10,
                },
                condition: {
                    minDep: "10",
                    wager: "20",
                    periodActivationDays: "7",
                },
            },
        ];

        store.vipAdventuresConfigFile = config;

        mockUserStatuses.getUserStatuses = [
            { name: "__1/3__2024-01-01" },
        ];

        const days = store.vipAdventuresDays;

        expect(days).toHaveLength(2);

        expect(days[0]).toMatchObject({
            day: "2024-01-01",
            step: 1,
            stepTotal: 3,
            isCompleted: true,
        });

        expect(days[1].isCompleted).toBe(false);
    });

    it("computes calendarConfig correctly", () => {
        const store = useVipAdventures();

        const config: IPrizeConfigItem[] = [
            {
                title: "__1/1__2024-01-10",
                prize: {
                    bonus: "50",
                },
                condition: {
                    minDep: "0",
                    wager: "1",
                    periodActivationDays: "7",
                },
            },
        ];

        store.vipAdventuresConfigFile = config;

        const calendar = store.calendarConfig;

        expect(calendar).toHaveLength(1);
        expect(calendar[0]).toMatchObject({
            index: 0,
            fullDate: "2024-01-10",
            day: 10,
            today: false,
        });
    });

    it("computes superDay correctly", () => {
        const store = useVipAdventures();

        store.vipAdventuresConfigFile = [
            {
                title: "__1/1__2024-01-10",
                prize: {
                    bonus: "100",
                },
                condition: {
                    minDep: "0",
                    wager: "1",
                    periodActivationDays: "7",
                },
            },
        ];

        const superDay = store.superDay!;

        expect(superDay.step).toBe(2);
        expect(superDay.day).toBe(
            dayjs("2024-01-10", formatDateVipAdv)
                .add(1, "day")
                .format(formatDateVipAdv),
        );
    });

    it("resolves userGroupForAdventure", () => {
        const store = useVipAdventures();

        mockUserStatuses.getUserGroups = [ "regular", VIP_ADV_GROUP ];

        expect(store.userGroupForAdventure).toBe(VIP_ADV_GROUP);
    });
});
