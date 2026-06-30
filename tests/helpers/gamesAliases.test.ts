import { describe, expect, it } from "vitest";

import { matchGamesAlias } from "../../src/helpers/gameHelpers";
import type { IGamesAliasesConfig } from "../../src/models/configs";

const config: IGamesAliasesConfig = {
    enabled: true,
    aliases: [
        { keys: [ "bulls eye", "bull", "the bull eye" ], games: [ "gamzix/Bull", "bsg/3MillionBC" ] },
        { keys: [ "sweet bonanza" ], games: [ "pragmatic/Sweet" ] },
    ],
};

describe("matchGamesAlias", () => {
    it("matches a key contained in the query, case-insensitive and trimmed", () => {
        expect(matchGamesAlias("  BULLS Eye ", config)).toEqual([ "gamzix/Bull", "bsg/3MillionBC" ]);
    });

    it("matches when the query contains a multi-word key with collapsed spaces", () => {
        expect(matchGamesAlias("the   bull   eye", config)).toEqual([ "gamzix/Bull", "bsg/3MillionBC" ]);
    });

    it("returns the first matching alias by config order", () => {
        expect(matchGamesAlias("bull bonanza", config)).toEqual([ "gamzix/Bull", "bsg/3MillionBC" ]);
    });

    it("returns an empty array when no key matches", () => {
        expect(matchGamesAlias("starburst", config)).toEqual([]);
    });

    it("returns an empty array when config is missing or disabled", () => {
        expect(matchGamesAlias("bull", undefined)).toEqual([]);
        expect(matchGamesAlias("bull", { enabled: false, aliases: config.aliases })).toEqual([]);
        expect(matchGamesAlias("bull", { enabled: true, aliases: [] })).toEqual([]);
    });
});
