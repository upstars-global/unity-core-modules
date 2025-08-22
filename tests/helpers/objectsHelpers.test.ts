import { describe, expect, it } from "vitest";

import { concatValues, getAllPaths } from "../../src/helpers/objectsHelpers";

describe("objectsHelpers", () => {
    it("getAllPaths returns paths including arrays with indices", () => {
        const obj = { a: 1, b: { c: [ { d: 2 }, 3 ] }, e: { f: { g: 4 } } };
        const paths = getAllPaths(obj).sort();
        expect(paths).toContain("a");
        expect(paths).toContain("b.c[0].d");
        expect(paths).toContain("b.c[1]");
        expect(paths).toContain("e.f.g");
    });

    it("concatValues joins object values", () => {
        expect(concatValues({ a: "1", b: "2", c: "3" })).toBe("123");
    });
});
