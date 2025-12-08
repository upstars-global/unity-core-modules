import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { log } from "../../src/controllers/Logger";
import { Currencies } from "../../src/models/enums/currencies";
import type { IJackpotItem } from "../../src/services/api/DTO/jackpot";
import { useJackpots } from "../../src/store/jackpots";

vi.mock("../../src/controllers/Logger", () => ({
    log: {
        error: vi.fn(),
    },
}));

const createJackpot = (overrides: Partial<IJackpotItem> = {}): IJackpotItem => ({
    id: 1,
    name: "Daily Jackpot",
    allowed_currencies: [ "EUR" ],
    currency: Currencies.EUR,
    external_id: "external-jackpot",
    games: [ "game-1" ],
    identifier: "jackpot-identifier",
    state: "active",
    levels: [],
    ...overrides,
});

const logErrorMock = vi.mocked(log.error);

describe("useJackpots store", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    it("initializes with empty lists", () => {
        const store = useJackpots();

        expect(store.jackpotsList).toEqual([]);
        expect(store.jackpotsActiveList).toEqual([]);
    });

    it("setJackpotsList populates data and derives active items", () => {
        const activeJackpot = createJackpot({ id: 10, state: "active" });
        const disabledJackpot = createJackpot({ id: 11, state: "disabled" });
        const store = useJackpots();

        store.setJackpotsList([ activeJackpot, disabledJackpot ]);

        expect(store.jackpotsList).toEqual([ activeJackpot, disabledJackpot ]);
        expect(store.jackpotsActiveList).toEqual([ activeJackpot ]);
    });

    it("updateJackpotItemInList replaces jackpot details when id matches", () => {
        const first = createJackpot({ id: 1, name: "Jackpot Alpha", state: "active" });
        const second = createJackpot({ id: 2, name: "Jackpot Beta", state: "disabled" });
        const store = useJackpots();
        store.setJackpotsList([ first, second ]);

        const updatedSecond = { ...second, name: "Jackpot Beta Updated", state: "active" };
        store.updateJackpotItemInList({ data: updatedSecond });

        expect(store.jackpotsList).toEqual([ first, updatedSecond ]);
        expect(store.jackpotsActiveList).toEqual([ first, updatedSecond ]);
    });

    it("logs error when updateJackpotItemInList fails to splice", () => {
        const jackpot = createJackpot({ id: 100 });
        const store = useJackpots();
        store.setJackpotsList([ jackpot ]);

        const error = new Error("splice failure");
        const spliceSpy = vi.spyOn(store.jackpotsList, "splice").mockImplementation(() => {
            throw error;
        });

        store.updateJackpotItemInList({ data: { ...jackpot, name: "Broken" } });

        expect(logErrorMock).toHaveBeenCalledWith("UPDATE_JACKPOT_ITEM_IN_LIST_ERROR", error);
        expect(store.jackpotsList[0]).toEqual(jackpot);

        spliceSpy.mockRestore();
    });
});
