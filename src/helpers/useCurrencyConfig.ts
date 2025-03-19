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
        for (let i = 0; i < steps.length; i++) {
            const { min, max, step } = steps[i];

            if (amount >= min && amount < Number(max)) {
                let nextAmount = Math.ceil(amount / step) * step;
                nextAmount = roundAmount(nextAmount, precision);

                if (nextAmount > amount) {
                    return nextAmount;
                }

                const newAmount = nextAmount + step < Number(max) ? nextAmount + step : Number(max);

                return roundAmount(newAmount, precision);
            }
        }

        return roundAmount(amount, precision);
    }

    function decreaseAmount(amount: number, steps: Step[], precision = 0) {
        for (let i = 0; i < steps.length; i++) {
            const { min, max, step } = steps[i];

            if (amount >= min && amount < Number(max)) {
                let nextAmount = Math.floor(amount / step) * step;
                nextAmount = roundAmount(nextAmount, precision);

                if (nextAmount < amount) {
                    return nextAmount;
                }

                const newAmount = nextAmount - step >= min
                    ? nextAmount - step
                    : (Number(steps[i - 1]?.max) - steps[i - 1]?.step || min);

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
