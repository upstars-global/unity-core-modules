import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";

import { useCurrencyConfig } from "../../src/helpers/useCurrencyConfig";
import type { CurrencyConfig, CurrencyData } from "../../src/models/cashbox";
import { useCommon } from "../../src/store/common";
import { useUserInfo } from "../../src/store/user/userInfo";

const defaultUsdConfig: CurrencyConfig = {
    defaultAmount: 10,
    rounding: 2,
    steps: [ { min: 10, max: 100, step: 10 } ],
};
const defaultEurConfig: CurrencyConfig = {
    defaultAmount: 20,
    rounding: 2,
    steps: [ { min: 20, max: 200, step: 20 } ],
};
const groupUsdConfig: CurrencyConfig = {
    defaultAmount: 50,
    rounding: 0,
    steps: [ { min: 50, max: 500, step: 50 } ],
};

function setConfig(config: CurrencyData, currency = "USD", groups: Array<string | number> = []) {
    useCommon().setCurrencyConfig(config);
    useUserInfo().setUserData({
        currency,
        statuses: groups.map((id) => ({ id, name: String(id) })),
    });
}

describe("useCurrencyConfig", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe("userCurrencyConfig", () => {
        it("returns null when currency config is not loaded", () => {
            const { userCurrencyConfig } = useCurrencyConfig();

            expect(userCurrencyConfig.value).toBeNull();
        });

        it("returns group config when exactly one user group matches", () => {
            setConfig({
                default: {
                    USD: defaultUsdConfig,
                },
                "10": {
                    USD: groupUsdConfig,
                },
            }, "USD", [ 10 ]);

            const { userCurrencyConfig } = useCurrencyConfig();

            expect(userCurrencyConfig.value).toEqual(groupUsdConfig);
        });

        it("overrides only defaultAmount from group config", () => {
            setConfig({
                default: {
                    USD: defaultUsdConfig,
                },
                "10": {
                    USD: {
                        defaultAmount: 50,
                    },
                },
            }, "USD", [ 10 ]);

            const { userCurrencyConfig } = useCurrencyConfig();

            expect(userCurrencyConfig.value).toEqual({
                ...defaultUsdConfig,
                defaultAmount: 50,
            });
        });

        it("overrides only steps from group config", () => {
            const groupSteps = [ { min: 25, max: 250, step: 25 } ];
            setConfig({
                default: {
                    USD: defaultUsdConfig,
                },
                "10": {
                    USD: {
                        steps: groupSteps,
                    },
                },
            }, "USD", [ 10 ]);

            const { userCurrencyConfig } = useCurrencyConfig();

            expect(userCurrencyConfig.value).toEqual({
                ...defaultUsdConfig,
                steps: groupSteps,
            });
        });

        it("returns default config when group configs are absent", () => {
            setConfig({
                default: {
                    USD: defaultUsdConfig,
                },
            }, "USD", [ 10 ]);

            const { userCurrencyConfig } = useCurrencyConfig();

            expect(userCurrencyConfig.value).toEqual(defaultUsdConfig);
        });

        it.each([
            {
                description: "no user groups match",
                groups: [ 20 ],
            },
            {
                description: "several user groups match",
                groups: [ 10, 11 ],
            },
        ])("returns default config when $description", ({ groups }) => {
            setConfig({
                default: {
                    USD: defaultUsdConfig,
                },
                "10": {
                    USD: groupUsdConfig,
                },
                "11": {
                    USD: {
                        ...groupUsdConfig,
                        defaultAmount: 100,
                    },
                },
            }, "USD", groups);

            const { userCurrencyConfig } = useCurrencyConfig();

            expect(userCurrencyConfig.value).toEqual(defaultUsdConfig);
        });

        it("keeps default currency config when matching group does not override it", () => {
            setConfig({
                default: {
                    USD: defaultUsdConfig,
                    EUR: defaultEurConfig,
                },
                "10": {
                    USD: groupUsdConfig,
                },
            }, "EUR", [ 10 ]);

            const { userCurrencyConfig } = useCurrencyConfig();

            expect(userCurrencyConfig.value).toEqual(defaultEurConfig);
        });

        it("returns null when selected currency is absent from default and group configs", () => {
            setConfig({
                default: {
                    EUR: defaultEurConfig,
                },
                "10": {
                    EUR: defaultEurConfig,
                },
            }, "USD", [ 10 ]);

            const { userCurrencyConfig } = useCurrencyConfig();

            expect(userCurrencyConfig.value).toBeNull();
        });
    });

    describe("increaseAmount", () => {
        const steps = [
            { min: 10, max: 100, step: 10 },
            { min: 100, max: 500, step: 50 },
        ];

        it("returns the first minimum when amount is below the configured range", () => {
            const { increaseAmount } = useCurrencyConfig();

            expect(increaseAmount(5, steps)).toBe(10);
        });

        it("rounds amount up to the nearest step", () => {
            const { increaseAmount } = useCurrencyConfig();

            expect(increaseAmount(21, steps)).toBe(30);
        });

        it("adds a step when amount is already aligned", () => {
            const { increaseAmount } = useCurrencyConfig();

            expect(increaseAmount(20, steps)).toBe(30);
        });

        it("returns range maximum when the next step reaches it", () => {
            const { increaseAmount } = useCurrencyConfig();

            expect(increaseAmount(90, steps)).toBe(100);
        });

        it("uses the next range at a shared boundary", () => {
            const { increaseAmount } = useCurrencyConfig();

            expect(increaseAmount(100, steps)).toBe(150);
        });

        it("returns rounded amount when it is outside all ranges", () => {
            const { increaseAmount } = useCurrencyConfig();

            expect(increaseAmount(501.126, steps, 2)).toBe(501.13);
        });

        it("applies configured precision to decimal steps", () => {
            const { increaseAmount } = useCurrencyConfig();
            const decimalSteps = [ { min: 0.1, max: 1, step: 0.1 } ];

            expect(increaseAmount(0.31, decimalSteps, 2)).toBe(0.4);
        });
    });

    describe("decreaseAmount", () => {
        const steps = [
            { min: 10, max: 100, step: 10 },
            { min: 100, max: 500, step: 50 },
        ];

        it("rounds amount down to the nearest step", () => {
            const { decreaseAmount } = useCurrencyConfig();

            expect(decreaseAmount(29, steps)).toBe(20);
        });

        it("subtracts a step when amount is already aligned", () => {
            const { decreaseAmount } = useCurrencyConfig();

            expect(decreaseAmount(30, steps)).toBe(20);
        });

        it("does not return a value below the current range minimum", () => {
            const { decreaseAmount } = useCurrencyConfig();
            const offsetSteps = [ { min: 15, max: 100, step: 10 } ];

            expect(decreaseAmount(16, offsetSteps)).toBe(15);
        });

        it("returns the first minimum when decreasing from it", () => {
            const { decreaseAmount } = useCurrencyConfig();

            expect(decreaseAmount(10, steps)).toBe(10);
        });

        it("uses the last step of the previous range at a shared boundary", () => {
            const { decreaseAmount } = useCurrencyConfig();

            expect(decreaseAmount(100, steps)).toBe(90);
        });

        it("returns rounded amount when it is outside all ranges", () => {
            const { decreaseAmount } = useCurrencyConfig();

            expect(decreaseAmount(501.126, steps, 2)).toBe(501.13);
        });

        it("applies configured precision to decimal steps", () => {
            const { decreaseAmount } = useCurrencyConfig();
            const decimalSteps = [ { min: 0.1, max: 1, step: 0.1 } ];

            expect(decreaseAmount(0.39, decimalSteps, 2)).toBe(0.3);
        });
    });
});
