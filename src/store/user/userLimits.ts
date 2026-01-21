import { defineStore, storeToRefs } from "pinia";
import { computed, ref } from "vue";

import { type Currencies } from "../../models/enums/currencies";
import { type IUserLimit } from "../../services/api/DTO/userLimits";
import { useCommon } from "../common";
import { useConfigStore } from "../configStore";
import { useUserInfo } from "./userInfo";

export const useUserLimits = defineStore("userLimits", () => {
    const { $defaultProjectConfig } = useConfigStore();
    const { LIMIT_TYPE_COOLING_OFF, LIMIT_TYPE_DEPOSIT } = $defaultProjectConfig;
    const { isCryptoCurrency } = useCommon();

    const limits = ref<IUserLimit[]>([]);
    const isOnlyFiatLimits = ref<boolean>(false);

    const getUserLimits = computed(() => {
        return limits.value.map(({ ...limitItem }) => {
            if (limitItem.accounts) {
                const filteredAccounts = limitItem.accounts.filter(({ currency }) => !isCryptoCurrency(currency as Currencies));
                return {
                    ...limitItem,
                    accounts: filteredAccounts,
                };
            }

            return limitItem;
        });
    });

    const getLimits = computed(() => {
        return isOnlyFiatLimits.value ? getUserLimits.value : limits.value;
    });

    const isOneLimitReached = computed<boolean>(() => {
        const specialType = [ LIMIT_TYPE_COOLING_OFF ];
        const { getUserCurrency: userCurr } = storeToRefs(useUserInfo());

        return Boolean(getLimits.value.length) && getLimits.value.some((limit) => {
            if (specialType.includes(limit.type)) {
                return true;
            }

            return limit.accounts?.some((acc) => {
                return limit.type !== LIMIT_TYPE_DEPOSIT &&
                  acc.currency === userCurr.value &&
                    acc.current_value_amount_cents <= 0 &&
                    acc.amount_cents - Math.abs(acc.current_value_amount_cents) <= 0;
            });
        });
    });

    const hasDepositLimit = computed<boolean | undefined>(() => {
        const { getUserCurrency: userCurr } = storeToRefs(useUserInfo());
        return Boolean(getLimits.value.length) && getLimits.value.some((limit) => {
            return limit.accounts?.some((acc) => {
                return limit.type === LIMIT_TYPE_DEPOSIT &&
                  acc.currency === userCurr.value &&
                    acc.amount_cents - Math.abs(acc.current_value_amount_cents) <= 0;
            });
        });
    });

    const hasSomeReachedLimit = computed<boolean>(() => {
        const specialType = [ LIMIT_TYPE_COOLING_OFF ];

        return Boolean(getLimits.value.length) && getLimits.value.some((limit) => {
            if (specialType.includes(limit.type)) {
                return true;
            }
            return limit.accounts?.some((acc) => {
                return acc.amount_cents - Math.abs(acc.current_value_amount_cents) <= 0;
            });
        });
    });

    function getLimitsByType(type: string): IUserLimit[] {
        return getLimits.value.filter((limitItem: IUserLimit) => limitItem.type === type);
    };

    function setOnlyFiatLimits(value: boolean): void {
        isOnlyFiatLimits.value = value;
    }

    function clearState() {
        limits.value = [];
    }

    function setUserLimits(newLimits: IUserLimit[]) {
        limits.value = newLimits;
    }

    return {
        limits,
        getUserLimits,
        setUserLimits,

        getLimitsByType,
        isOneLimitReached,
        hasDepositLimit,
        hasSomeReachedLimit,

        setOnlyFiatLimits,

        clearState,
    };
});
