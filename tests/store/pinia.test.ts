import { describe, expect, it } from "vitest";

import { pinia } from "../../src/store/pinia";

describe("pinia instance", () => {
    it("exports a pinia instance with install method", () => {
        expect(pinia).toBeDefined();
        expect(typeof pinia.install).toBe("function");
    });
});
