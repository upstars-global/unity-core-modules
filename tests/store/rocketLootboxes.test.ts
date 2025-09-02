import dayjs from "dayjs";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

import { EnumLootboxState, Mode } from "../../src/models/lootboxes";
import { useLootboxesStore } from "../../src/store/lootboxes";
import { useRocketLootboxesStore } from "../../src/store/rocketLootboxes";

const mockLootbox = (overrides = {}) => ({
    id: 1,
    group_key: Mode.Lite,
    stage: EnumLootboxState.issued,
    created_at: dayjs().subtract(1, "day").toISOString(),
    valid_until: dayjs().add(1, "day").toISOString(),
    items: [ { prize: true }, { prize: false } ],
    used: false,
    available: true,
    prize: { prize: true },
    ...overrides,
});

vi.mock("../../src/store/lootboxes", () => ({
    useLootboxesStore: vi.fn(() => ({
        lootboxesList: ref([
            mockLootbox(),
            mockLootbox({
                id: 2,
                group_key: Mode.Pro,
                stage: EnumLootboxState.activated,
                created_at: dayjs().toISOString(),
                items: [ { prize: false } ],
                used: true,
                available: false,
                prize: undefined,
            }),
            mockLootbox({
                id: 3,
                group_key: Mode.Max,
                stage: EnumLootboxState.expired,
            }),
        ]),
    })),
}));

vi.mock("../../src/store/CMS", () => ({
    useCMS: () => ({ currentStaticPage: ref({ meta: { json: { skin: { color: "red" } } } }) }),
}));


describe("useRocketLootboxesStore", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.resetAllMocks();
    });

    it("filters valid lootboxes correctly", () => {
        const store = useRocketLootboxesStore();
        expect(store.lootboxes[Mode.Lite].id).toBe(1);
        expect(store.lootboxes[Mode.Pro].id).toBe(2);
        expect(store.lootboxes[Mode.Max].id).not.toBeDefined();
    });

    it("computes notUsedLootboxes", () => {
        const store = useRocketLootboxesStore();

        expect(store.notUsedLootboxes.every((lootbox) => !lootbox.used)).toBe(true);
    });

    it("returns correct skin from CMS", () => {
        const store = useRocketLootboxesStore();

        expect(store.skin).toEqual({ color: "red" });
    });

    it("lootbox available/used flags are correct", () => {
        const store = useRocketLootboxesStore();

        expect(store.lootboxes[Mode.Lite].available).toBe(true);
        expect(store.lootboxes[Mode.Pro].used).toBe(true);
        expect(store.lootboxes[Mode.Max].used).toBe(false);
    });

    it("lootbox prize is detected", () => {
        const store = useRocketLootboxesStore();
        expect(store.lootboxes[Mode.Lite].prize).toEqual({ prize: true });
        expect(store.lootboxes[Mode.Pro].prize).toBeUndefined();
        expect(store.lootboxes[Mode.Max].prize).toBeUndefined();
    });

    it("returns empty lootboxes if all are expired", () => {
        useLootboxesStore.mockReturnValue({
            lootboxesList: ref([
                mockLootbox({ id: 10, group_key: Mode.Lite, stage: EnumLootboxState.expired }),
                mockLootbox({ id: 11, group_key: Mode.Pro, stage: EnumLootboxState.expired }),
                mockLootbox({ id: 12, group_key: Mode.Max, stage: EnumLootboxState.expired }),
            ]),
        });

        const store = useRocketLootboxesStore();

        expect(store.lootboxes[Mode.Lite].id).not.toBeDefined();
        expect(store.lootboxes[Mode.Pro].id).not.toBeDefined();
        expect(store.lootboxes[Mode.Max].id).not.toBeDefined();
    });

    it("returns empty lootboxes if all are activated but not today", () => {
        useLootboxesStore.mockReturnValue({
            lootboxesList: ref([
                mockLootbox({
                    id: 20,
                    group_key: Mode.Lite,
                    stage: EnumLootboxState.activated,
                    created_at: dayjs().subtract(2, "day").toISOString(),
                }),
                mockLootbox({
                    id: 21,
                    group_key: Mode.Pro,
                    stage: EnumLootboxState.activated,
                    created_at: dayjs().subtract(3, "day").toISOString(),
                }),
            ]),
        });

        const store = useRocketLootboxesStore();

        expect(store.lootboxes[Mode.Lite].id).not.toBeDefined();
        expect(store.lootboxes[Mode.Pro].id).not.toBeDefined();
    });

    it("returns lootboxes if all are activated today", () => {
        useLootboxesStore.mockReturnValue({
            lootboxesList: ref([
                mockLootbox({ id: 30, group_key: Mode.Lite, stage: EnumLootboxState.activated, created_at: dayjs().toISOString() }),
                mockLootbox({ id: 31, group_key: Mode.Pro, stage: EnumLootboxState.activated, created_at: dayjs().toISOString() }),
            ]),
        });

        const store = useRocketLootboxesStore();
        expect(store.lootboxes[Mode.Lite].id).toBe(30);
        expect(store.lootboxes[Mode.Pro].id).toBe(31);

        expect(store.notUsedLootboxes.length).toBe(1);
    });

    it("returns empty lootboxes if list is empty", () => {
        useLootboxesStore.mockReturnValue({
            lootboxesList: ref([]),
        });

        const store = useRocketLootboxesStore();

        expect(store.lootboxes[Mode.Lite].id).not.toBeDefined();
        expect(store.lootboxes[Mode.Pro].id).not.toBeDefined();
        expect(store.lootboxes[Mode.Max].id).not.toBeDefined();
    });
});
