import { describe, expect, it } from "vitest";

import { getErrorMessage } from "../../src/helpers/formErrorMessageHelper";

describe("formErrorMessageHelper", () => {
    it("returns string as-is", () => {
        expect(getErrorMessage("Error!")).toBe("Error!");
    });

    it("returns first item from array", () => {
        expect(getErrorMessage([ "First", "Second" ])).toBe("First");
    });

    it("returns first value from object", () => {
        expect(getErrorMessage({ field: "Message", other: "x" })).toBe("Message");
    });
});
