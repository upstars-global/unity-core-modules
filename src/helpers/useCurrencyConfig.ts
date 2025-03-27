import { storeToRefs } from "pinia";
import { computed } from "vue";

import type { CurrencyCode, CurrencyConfig, Step } from "../models/cashbox";
import { useCommon } from "../store/common";
import { useUserInfo } from "../store/user/userInfo";

export function useCurrencyConfig() {
    const { currencyConfig } = storeToRefs(useCommon());
    const { getUserCurrency } = storeToRefs(useUserInfo());

    const userCurrencyConfig = computed<CurrencyConfig | null>(() => {
        return currencyConfig.value?.[getUserCurrency.value as CurrencyCode] ?? null;
    });

    function roundAmount(amount: number, precision: number) {
        return parseFloat(amount.toFixed(precision));
    }

    function increaseAmount(amount: number, steps: Step[], precision = 0) {
        const epsilon = 1e-10;

        for (let i = 0; i < steps.length; i++) {
            const { min, max, step } = steps[i];

            if (amount >= min && amount < Number(max)) {
                const ratio = (amount - min) / step;
                let nextAmount = min + (Math.floor(ratio + epsilon) + 1) * step;

                if (nextAmount > Number(max)) {
                    nextAmount = Number(max);
                }

                return roundAmount(nextAmount, precision);
            }
        }

        return roundAmount(amount, precision);
    }

    function decreaseAmount(amount: number, steps: Step[], precision = 0) {
        const epsilon = 1e-10;

        for (let i = 0; i < steps.length; i++) {
            const { min, max, step } = steps[i];

            if (amount >= min && amount < Number(max)) {
                const division = (amount - min) / step;

                if (Math.abs(division - Math.round(division)) < epsilon) {
                    if (amount === min) {
                        if (i > 0) {
                            return roundAmount(Number(steps[i - 1].max) - steps[i - 1].step, precision);
                        }
                        return roundAmount(min, precision);
                    }
                    return roundAmount(amount - step, precision);
                }

                const downAmount = min + Math.floor((amount - min) / step) * step;

                return roundAmount(downAmount, precision);
            }
        }

        return roundAmount(amount, precision);
    }

    return {
        increaseAmount,
        decreaseAmount,
        userCurrencyConfig,
    };
};
