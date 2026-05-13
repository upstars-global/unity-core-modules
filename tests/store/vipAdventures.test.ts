import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";
import weekday from "dayjs/plugin/weekday";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { IPrizeConfigItem, IVipAdventuresConfig } from "../../src/services/api/DTO/vipAdventuresDTO";
import {
    parseAdventuresTitleDayConfig,
    parseGiftAdventureTitle,
    useVipAdventures,
} from "../../src/store/user/vipAdventures";


dayjs.extend(weekday);
dayjs.extend(utc);
dayjs.extend(customParseFormat);


const defaultProjectConfig = {
    vipAdventures: {

    },
};

vi.mock("../../src/store/configStore", () => ({
    useConfigStore: () => ({
        $defaultProjectConfig: defaultProjectConfig,
    }),
}));

let useMockerValue = false;

vi.mock("../../src/store/environments", () => ({
    useEnvironments: () => ({
        useMocker: useMockerValue,
    }),
}));

const mockUserStatuses = {
    getUserStatuses: [] as { name: string }[],
    getUserGroups: [] as Array<string | number>,
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

    it("parseGiftAdventureTitle returns string when format doesn't match", () => {
        expect(parseGiftAdventureTitle("Plain Title")).toBe("Plain Title");
    });
});


describe("useVipAdventures store", () => {
    beforeEach(() => {
        setActivePinia(createPinia());

        mockUserStatuses.getUserStatuses = [];
        mockUserStatuses.getUserGroups = [];
        useMockerValue = false;
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
                title: "__1/3__01/01/2024",
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
                title: "__2/3__02/01/2024",
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

        store.vipAdventuresFullConfig = { prizes: { 791: config }, variables: {} } as unknown as IVipAdventuresConfig;
        mockUserStatuses.getUserGroups = [ 791 ];

        mockUserStatuses.getUserStatuses = [
            { name: "__1/3__01/01/2024" },
        ];

        const days = store.vipAdventuresDays;

        expect(days).toHaveLength(2);

        expect(days[0]).toMatchObject({
            day: "01/01/2024",
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
                title: "__1/1__10/01/2024",
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

        store.vipAdventuresFullConfig = { prizes: { 791: config }, variables: {} } as unknown as IVipAdventuresConfig;
        mockUserStatuses.getUserGroups = [ 791 ];

        const calendar = store.calendarConfig;

        expect(calendar).toHaveLength(1);
        expect(calendar[0]).toMatchObject({
            index: 0,
            fullDate: "10/01/2024",
            day: 10,
            today: false,
        });
    });

    it("uses mocked day when useMocker is enabled", () => {
        useMockerValue = true;
        const store = useVipAdventures();
        store.vipAdventuresFullConfig = { prizes: { 791: [
            {
                title: "__1/3__01/01/2024",
                prize: { bonus: "1" },
                condition: { minDep: "0", wager: "1", periodActivationDays: "7" },
            },
            {
                title: "__2/3__02/01/2024",
                prize: { bonus: "2" },
                condition: { minDep: "0", wager: "1", periodActivationDays: "7" },
            },
            {
                title: "__3/3__03/01/2024",
                prize: { bonus: "3" },
                condition: { minDep: "0", wager: "1", periodActivationDays: "7" },
            },
        ] as IPrizeConfigItem[] }, variables: {} } as unknown as IVipAdventuresConfig;
        mockUserStatuses.getUserGroups = [ 791 ];

        expect(store.toDay.format("DD/MM/YYYY")).toBe("03/01/2024");
    });

    it("computes superConfig based on last calendar day", () => {
        const store = useVipAdventures();
        store.vipAdventuresFullConfig = { prizes: { 791: [
            {
                title: "__1/1__10/01/2024",
                prize: { bonus: "1" },
                condition: { minDep: "0", wager: "1", periodActivationDays: "7" },
            },
        ] as IPrizeConfigItem[] }, variables: {} } as unknown as IVipAdventuresConfig;
        mockUserStatuses.getUserGroups = [ 791 ];

        expect(store.superConfig.index).toBe(1);
        expect(store.superConfig.today).toBe(true);
    });

    it("computes superDay correctly", () => {
        const store = useVipAdventures();

        store.vipAdventuresFullConfig = { prizes: { 791: [
            {
                title: "__1/1__10/01/2024",
                prize: {
                    bonus: "100",
                },
                condition: {
                    minDep: "0",
                    wager: "1",
                    periodActivationDays: "7",
                },
            },
        ] as IPrizeConfigItem[] }, variables: {} } as unknown as IVipAdventuresConfig;
        mockUserStatuses.getUserGroups = [ 791 ];

        const superDay = store.superDay!;

        expect(superDay.step).toBe(2);
        expect(superDay.day).toBe(
            dayjs("10/01/2024", "DD/MM/YYYY")
                .add(1, "day")
                .format("DD/MM/YYYY"),
        );
    });

    it("resolves userGroupForAdventure", () => {
        const store = useVipAdventures();

        store.vipAdventuresFullConfig = { prizes: { 791: [], 992: [] }, variables: {} } as unknown as IVipAdventuresConfig;
        mockUserStatuses.getUserGroups = [ "regular", 791 ];

        expect(store.userGroupForAdventure).toBe("791");
    });

    it("resolves first matching group by config keys order", () => {
        const store = useVipAdventures();

        store.vipAdventuresFullConfig = { prizes: { 791: [], 992: [] }, variables: {} } as unknown as IVipAdventuresConfig;
        mockUserStatuses.getUserGroups = [ "regular", 992, 791 ];

        expect(store.userGroupForAdventure).toBe("791");
    });

    it("resolves string-based userGroupForAdventure correctly", () => {
        const store = useVipAdventures();

        store.vipAdventuresFullConfig = { prizes: { vip_gold: [] }, variables: {} } as unknown as IVipAdventuresConfig;
        mockUserStatuses.getUserGroups = [ "regular", "vip_gold" ];

        expect(store.userGroupForAdventure).toBe("vip_gold");
    });

    it("returns undefined when user has no adventure groups", () => {
        const store = useVipAdventures();

        store.vipAdventuresFullConfig = { prizes: { 791: [], 992: [] }, variables: {} } as unknown as IVipAdventuresConfig;
        mockUserStatuses.getUserGroups = [ "regular", "another_group" ];

        expect(store.userGroupForAdventure).toBeUndefined();
    });

    it("returns undefined when user group is not in config", () => {
        const store = useVipAdventures();

        const config791 = [ { title: "791" } as IPrizeConfigItem ];
        const config992 = [ { title: "992" } as IPrizeConfigItem ];

        store.vipAdventuresFullConfig = {
            prizes: { 791: config791, 992: config992 },
            variables: {},
        } as unknown as IVipAdventuresConfig;
        mockUserStatuses.getUserGroups = [ "regular", 12345 ]; // 12345 is not in config

        expect(store.userGroupForAdventure).toBeUndefined();
        expect(store.vipAdventuresConfigFile).toBeUndefined();
    });

    it("returns empty object when user group is not in config", () => {
        const store = useVipAdventures();

        const vars791 = { adv_1: { USD: "100" } } as unknown as Record<string, Record<Currencies, string>>;
        const vars992 = { adv_1: { USD: "200" } } as unknown as Record<string, Record<Currencies, string>>;

        store.vipAdventuresFullConfig = {
            prizes: { 791: [], 992: [] },
            variables: { 791: vars791, 992: vars992 },
        } as unknown as IVipAdventuresConfig;
        mockUserStatuses.getUserGroups = [ "regular" ]; // no group match

        expect(store.vipAdventuresVariables).toEqual({});
    });

    it("returns empty values when config is partially malformed or nullish", () => {
        const store = useVipAdventures();

        store.vipAdventuresFullConfig = { prizes: undefined, variables: undefined } as unknown as IVipAdventuresConfig;
        mockUserStatuses.getUserGroups = [ 791 ];

        expect(store.userGroupForAdventure).toBeUndefined();
        expect(store.vipAdventuresConfigFile).toBeUndefined();
        expect(store.vipAdventuresVariables).toEqual({});
    });
});
