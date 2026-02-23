import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ILevel } from "../../src/models/levels";
import { IStatuses } from "../../src/services/api/DTO/statuses";
import { useLevelsStore } from "../../src/store/levels/levelsStore";

const mockLevel = (overrides = {}) => ({
    name: "VIP 1",
    status: true,
    id: "vip_level_1",
    levelNumber: 1,
    min: 0,
    max: 100,
    image: "img1.png",
    ...overrides,
});

const mockGroup = (overrides = {}) => ({
    id: "group_1",
    name: "Group 1",
    status: false,
    writable: true,
    conditions: [],
    ...overrides,
});

vi.mock("@helpers/lootBoxes", () => ({
    mapLevelItem: vi.fn((item) => ({
        ...item,
        name: item.name || "Mocked Level",
        image: item.image || "mocked.png",
        levelNumber: 99,
    })),
}));

describe("useLevelsStore", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it("initializes with default values", () => {
        const store = useLevelsStore();
        expect(store.levels).toEqual([]);
        expect(store.groups).toEqual([]);
    });

    it("setLevelsData splits levels and groups, uses mocked mapLevelItem", () => {
        const store = useLevelsStore();
        const data = [
            { ...mockLevel(), status: true },
            { ...mockGroup(), status: false },
        ] as IStatuses[];

        store.setLevelsData(data);

        expect(store.levels.length).toBe(1);
        expect(store.groups.length).toBe(1);
        expect(store.levels[0].name).toBe("VIP 1");
        expect(store.levels[0].image).toBe("img1.png");
        expect(store.levels[0].levelNumber).toBe(99);
    });

    it("getLevelsData returns sorted and filtered levels", () => {
        const store = useLevelsStore();
        store.levels = [
            mockLevel({ id: "vip_level_2", levelNumber: 2 }),
            mockLevel({ id: "vip_level_1", levelNumber: 1 }),
            { ...mockLevel({ id: "vip_level_3", levelNumber: 3 }), status: false },
        ];
        const result = store.getLevelsData;
        expect(result.length).toBe(2);
        expect(result[0].id).toBe("vip_level_1");
        expect(result[1].id).toBe("vip_level_2");
    });

    it("sorts levels when indices are numeric", () => {
        const store = useLevelsStore();
        store.levels = [
            mockLevel({ id: "level_2", levelNumber: 2 }),
            mockLevel({ id: "level_1", levelNumber: 1 }),
        ];

        expect(store.getLevelsData[0].id).toBe("level_1");
    });

    it("keeps sort order when current index is less than next index", () => {
        const store = useLevelsStore();
        store.levels = [
            mockLevel({ id: "level_1", levelNumber: 1 }),
            mockLevel({ id: "level_2", levelNumber: 2 }),
        ];

        expect(store.getLevelsData[0].id).toBe("level_1");
    });

    it("getLevelsData keeps items with undefined id order", () => {
        const store = useLevelsStore();
        store.levels = [
            { ...mockLevel(), id: undefined as never, status: true },
            mockLevel({ id: "vip_level_2", levelNumber: 2 }),
        ];

        const result = store.getLevelsData;

        expect(result).toHaveLength(2);
        expect(result[0].id).toBeUndefined();
    });

    it("getLevels returns all levels", () => {
        const store = useLevelsStore();
        store.levels = [ mockLevel(), mockLevel({ id: "vip_level_2" }) ];
        expect(store.getLevels).toEqual([ mockLevel(), mockLevel({ id: "vip_level_2" }) ]);
    });

    it("getLevelsById returns correct level", () => {
        const store = useLevelsStore();
        store.levels = [ mockLevel(), mockLevel({ id: "vip_level_2" }) ];
        expect(store.getLevelsById("vip_level_2").id).toBe("vip_level_2");
    });

    it("getLevelsById returns empty object if not found", () => {
        const store = useLevelsStore();
        store.levels = [ mockLevel() ];
        expect(store.getLevelsById("not_found")).toEqual({});
    });

    it("getLevelImageById returns image for found level", () => {
        const store = useLevelsStore();
        store.levels = [ mockLevel({ id: "vip_level_1", image: "img1.png" }) ];
        expect(store.getLevelImageById({ id: "vip_level_1" } as ILevel)).toBe("img1.png");
    });

    it("getLevelImageById returns empty string if not found", () => {
        const store = useLevelsStore();
        store.levels = [ mockLevel({ id: "vip_level_1", image: "img1.png" }) ];
        expect(store.getLevelImageById({ id: "vip_level_2" } as ILevel)).toBe("");
    });
});
