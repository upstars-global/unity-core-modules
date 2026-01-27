import { describe, expect, it, vi } from "vitest";

import { parseJson } from "../../src/helpers/parseJson";

const mockLogError = vi.fn();

vi.mock("../../src/controllers/Logger", () => ({
    log: {
        error: (...args: unknown[]) => mockLogError(...args),
    },
}));

describe("parseJson", () => {
    it("parses valid json", () => {
        const result = parseJson("{\"id\":1}");
        expect(result).toEqual({ id: 1 });
    });

    it("logs error and returns undefined on invalid json", () => {
        const result = parseJson("{bad}", "CUSTOM_PARSE_ERROR");
        expect(result).toBeUndefined();
        expect(mockLogError).toHaveBeenCalledTimes(1);
        expect(mockLogError).toHaveBeenCalledWith("CUSTOM_PARSE_ERROR", expect.any(SyntaxError));
    });
});
