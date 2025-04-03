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

    const roundAmount = (amount: number, precision: number) => Number(amount.toFixed(precision));

    function increaseAmount(amount: number, steps: Step[], precision = 0) {
        if (amount < steps[0].min) {
            return steps[0].min;
        }

        for (let i = 0; i < steps.length; i++) {
            const { min, max, step } = steps[i];

            if (amount >= min && amount < Number(max)) {
                let candidate = roundAmount(Math.ceil(amount / step) * step, precision);

                if (candidate > amount) {
                    return candidate;
                }

                candidate = candidate + step < Number(max) ? candidate + step : Number(max);

                return roundAmount(candidate, precision);
            }
        }

        return roundAmount(amount, precision);
    }

    function decreaseAmount(amount: number, steps: Step[], precision = 0) {
        for (let i = 0; i < steps.length; i++) {
            const { min, max, step } = steps[i];

            if (amount >= min && amount < Number(max)) {
                const candidate = roundAmount(Math.floor(amount / step) * step, precision);

                if (candidate < min) {
                    return min;
                }

                if (candidate < amount) {
                    return candidate;
                }

                // eslint-disable-next-line @typescript-eslint/init-declarations
                let newAmount;

                if (candidate - step >= min) {
                    newAmount = candidate - step;
                } else {
                    newAmount = i > 0 ? Number(steps[i - 1].max) - steps[i - 1].step : min;
                }

                return roundAmount(newAmount, precision);
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
