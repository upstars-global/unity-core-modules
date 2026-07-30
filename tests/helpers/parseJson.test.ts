import { beforeEach, describe, expect, it, vi } from "vitest";

import { parseJson } from "../../src/helpers/parseJson";

const mockLogError = vi.fn();

vi.mock("../../src/controllers/Logger", () => ({
    log: {
        error: (...args: unknown[]) => mockLogError(...args),
    },
}));

describe("parseJson", () => {
    beforeEach(() => {
        mockLogError.mockClear();
    });

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

    it("adds snippet id to error message when provided", () => {
        const result = parseJson("{bad}", "CUSTOM_PARSE_ERROR", "snippet-1");
        expect(result).toBeUndefined();
        expect(mockLogError).toHaveBeenCalledTimes(1);
        expect(mockLogError).toHaveBeenCalledWith(
            "CUSTOM_PARSE_ERROR",
            expect.objectContaining({
                message: expect.stringContaining("Snippet id: snippet-1"),
            }),
        );
    });
});
