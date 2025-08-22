import { beforeEach, describe, expect, it } from "vitest";

import {
    getActionsByStatus,
    getCssGradient,
    isSameHost,
    sortBanners,
    TYPE_ACTION_BUTTON,
} from "../../src/helpers/bannerHelpers";
import { IBannerConfig } from "../../src/models/banners";
import { STATUS_PROMO } from "../../src/models/enums/tournaments";

describe("bannerHelpers", () => {
    describe("getCssGradient", () => {
        it("returns extended and short gradient strings", () => {
            const gradient = {
                colorLeft: "#111111",
                colorLeftCenter: "#222222",
                colorRightCenter: "#333333",
                colorRight: "#444444",
            };
            const res = getCssGradient(gradient);
            expect(res.extendedGradient.background).toContain("linear-gradient(");
            expect(res.extendedGradient.background).not.toContain("\n");
            expect(res.shortGradient.background).toBe("linear-gradient(to right, #444444, #111111)");
        });

        it("handles undefined gradient safely", () => {
            const res = getCssGradient(undefined);
            expect(res).toHaveProperty("extendedGradient");
            expect(res).toHaveProperty("shortGradient");
        });
    });

    describe("getActionsByStatus", () => {
        it("sorts by status and finds by frontend_identifier", () => {
            const list = [
                { frontend_identifier: "b", status: STATUS_PROMO.ARCHIVE },
                { frontend_identifier: "a", status: STATUS_PROMO.ACTIVE },
                { frontend_identifier: "c", status: STATUS_PROMO.FUTURE },
            ];
            const found = getActionsByStatus(list, "a");
            expect(found.frontend_identifier).toBe("a");
        });

        it("returns undefined if not found", () => {
            const list = [ { frontend_identifier: "x", status: STATUS_PROMO.ACTIVE } ];
            expect(getActionsByStatus(list, "y")).toBeUndefined();
        });
    });

    describe("isSameHost", () => {
        beforeEach(() => {
            global.location = { hostname: "localhost" } as Location;
        });

        it("returns true for same hostname", () => {
            const url = `${ location.protocol }//${ location.hostname }/path`;
            expect(isSameHost(url)).toBe(true);
        });

        it("returns false for different hostname", () => {
            const url = "https://example.com/path";
            // jsdom hostname is usually "localhost"

            if (location.hostname === "example.com") {
                expect(isSameHost("https://localhost/path")).toBe(false);
            } else {
                expect(isSameHost(url)).toBe(false);
            }
        });

        it("returns true on invalid URL (catch block)", () => {
            expect(isSameHost("not a url")).toBe(true);
        });
    });

    describe("sortBanners", () => {
        let list: IBannerConfig[] = [];
        beforeEach(() => {
            list = [
                { id: "1", order: { [TYPE_ACTION_BUTTON.TOURNAMENTS]: 2 } },
                { id: "2", order: { [TYPE_ACTION_BUTTON.TOURNAMENTS]: 1 } },
                { id: "3" },
            ] as unknown as IBannerConfig[];
        });

        it("sorts by provided key and keeps missing as Infinity", () => {
            const sorted = sortBanners(list, TYPE_ACTION_BUTTON.TOURNAMENTS);
            expect(sorted.map((i) => i.id)).toEqual([ "2", "1", "3" ]);
        });

        it("returns original list if invalid input", () => {
            expect(sortBanners(undefined, "x")).toBeUndefined();
            expect(sortBanners([], "x")).toEqual([]);
            expect(sortBanners(list, "")).toBe(list);
        });
    });
});
