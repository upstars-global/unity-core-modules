import { describe, expect, it } from "vitest";

import replaceStringHelper from "../../src/helpers/replaceStringHelper";

describe("replaceStringHelper", () => {
    it("replaces in string template", () => {
        const res = replaceStringHelper({ template: "Hello, NAME! NAME!", replaceString: "NAME", replaceValue: "World" });
        expect(res).toBe("Hello, World! World!");
    });

    it("replaces in object template deeply", () => {
        const template = { a: "NAME", b: { c: "NAME", d: [ "x", "NAME" ] } };
        const res = replaceStringHelper({ template, replaceString: "NAME", replaceValue: "ok" });
        expect(res).toEqual({ a: "ok", b: { c: "ok", d: [ "x", "ok" ] } });
        expect(template).toEqual({ a: "NAME", b: { c: "NAME", d: [ "x", "NAME" ] } });
    });

    it("returns template as-is for undefined", () => {
        const res = replaceStringHelper({ template: undefined, replaceString: "NAME", replaceValue: "ok" });
        expect(res).toBeUndefined();
    });
});
