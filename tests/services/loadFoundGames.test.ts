import { beforeEach, describe, expect, it, vi } from "vitest";

const postMock = vi.fn();
const loadGamesAliasesConfigReqMock = vi.fn();
const loadGamesByIdsReqMock = vi.fn();

vi.mock("../../src/controllers/Logger", () => ({
    log: { error: vi.fn() },
}));

vi.mock("pinia", async (importOriginal) => {
    const actual = await importOriginal<typeof import("pinia")>();

    return {
        ...actual,
        storeToRefs: (store: Record<string, unknown>) => {
            const refs: Record<string, { value: unknown }> = {};
            Object.keys(store).forEach((key) => {
                refs[key] = { value: store[key] };
            });

            return refs;
        },
    };
});

vi.mock("../../src/store/root", () => ({
    useRootStore: () => ({ isMobile: false }),
}));
vi.mock("../../src/store/games/gamesProviders", () => ({
    useGamesProviders: () => ({ disabledGamesProviders: {} }),
}));
vi.mock("../../src/store/games/gamesStore", () => ({
    useGamesCommon: () => ({ enabledGamesConfig: {} }),
}));

vi.mock("../../src/helpers/gameHelpers", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../../src/helpers/gameHelpers")>();

    return {
        ...actual,
        processGameForNewAPI: (game: unknown) => game,
        filterGames: (games: unknown[]) => games,
    };
});

vi.mock("../../src/services/api/http", () => ({
    http: () => ({ post: postMock }),
}));
vi.mock("../../src/services/api/requests/configs", () => ({
    loadGamesAliasesConfigReq: (...args: unknown[]) => loadGamesAliasesConfigReqMock(...args),
}));
vi.mock("../../src/services/api/requests/games", () => ({
    loadGamesByIdsReq: (...args: unknown[]) => loadGamesByIdsReqMock(...args),
}));

describe("loadFoundGames", () => {
    beforeEach(() => {
        vi.resetModules();
        postMock.mockReset();
        loadGamesAliasesConfigReqMock.mockReset();
        loadGamesByIdsReqMock.mockReset();
    });

    it("returns the standard search results without touching aliases when games are found", async () => {
        const games = [ { identifier: "a/b", provider: "p" } ];
        postMock.mockResolvedValue({ data: { data: games } });

        const { loadFoundGames } = await import("../../src/services/api/requests/gamesSearch");
        const result = await loadFoundGames("bull");

        expect(result).toEqual(games);
        expect(loadGamesAliasesConfigReqMock).not.toHaveBeenCalled();
        expect(loadGamesByIdsReqMock).not.toHaveBeenCalled();
    });

    it("requests the alias game ids and returns the games from the response values when a key matches", async () => {
        postMock.mockResolvedValue({ data: { data: [] } });
        loadGamesAliasesConfigReqMock.mockResolvedValue({
            enabled: true,
            aliases: [ { keys: [ "bull" ], games: [ "x/y", "z/w" ] } ],
        });
        loadGamesByIdsReqMock.mockResolvedValue({
            "backend-key-1": { identifier: "x/y" },
            "backend-key-2": { identifier: "z/w" },
        });

        const { loadFoundGames } = await import("../../src/services/api/requests/gamesSearch");
        const result = await loadFoundGames("bulls eye");

        expect(loadGamesByIdsReqMock).toHaveBeenCalledWith([ "x/y", "z/w" ], "desktop");
        expect(result).toEqual([ { identifier: "x/y" }, { identifier: "z/w" } ]);
    });

    it("returns an empty list when the standard search is empty and no alias matches", async () => {
        postMock.mockResolvedValue({ data: { data: [] } });
        loadGamesAliasesConfigReqMock.mockResolvedValue({
            enabled: true,
            aliases: [ { keys: [ "bull" ], games: [ "x/y" ] } ],
        });

        const { loadFoundGames } = await import("../../src/services/api/requests/gamesSearch");
        const result = await loadFoundGames("starburst");

        expect(result).toEqual([]);
        expect(loadGamesByIdsReqMock).not.toHaveBeenCalled();
    });

    it("returns an empty list when there is no alias config", async () => {
        postMock.mockResolvedValue({ data: { data: [] } });
        loadGamesAliasesConfigReqMock.mockResolvedValue(undefined);

        const { loadFoundGames } = await import("../../src/services/api/requests/gamesSearch");
        const result = await loadFoundGames("bull");

        expect(result).toEqual([]);
        expect(loadGamesByIdsReqMock).not.toHaveBeenCalled();
    });
});
