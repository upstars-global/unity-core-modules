import { describe, expect, it } from "vitest";

import { matchSearchAliasGames } from "../../src/helpers/gameHelpers";
import type { ISearchAliasConfig } from "../../src/models/configs";

const config: ISearchAliasConfig = {
    enabled: true,
    aliases: [
        { keys: [ "bulls eye", "bull", "the bull eye" ], games: [ "gamzix/Bull", "bsg/3MillionBC" ] },
        { keys: [ "sweet bonanza" ], games: [ "pragmatic/Sweet" ] },
    ],
};

describe("matchSearchAliasGames", () => {
    it("matches a key contained in the query, case-insensitive and trimmed", () => {
        expect(matchSearchAliasGames("  BULLS Eye ", config)).toEqual([ "gamzix/Bull", "bsg/3MillionBC" ]);
    });

    it("matches when the query contains a multi-word key with collapsed spaces", () => {
        expect(matchSearchAliasGames("the   bull   eye", config)).toEqual([ "gamzix/Bull", "bsg/3MillionBC" ]);
    });

    it("returns the first matching alias by config order", () => {
        expect(matchSearchAliasGames("bull bonanza", config)).toEqual([ "gamzix/Bull", "bsg/3MillionBC" ]);
    });

    it("returns an empty array when no key matches", () => {
        expect(matchSearchAliasGames("starburst", config)).toEqual([]);
    });

    it("returns an empty array when config is missing or disabled", () => {
        expect(matchSearchAliasGames("bull", undefined)).toEqual([]);
        expect(matchSearchAliasGames("bull", { enabled: false, aliases: config.aliases })).toEqual([]);
        expect(matchSearchAliasGames("bull", { enabled: true, aliases: [] })).toEqual([]);
    });
});
