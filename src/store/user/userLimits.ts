import { defineStore, storeToRefs } from "pinia";
import { computed, ref } from "vue";

import log from "../../controllers/Logger";
import { LIMIT_TYPE_COOLING_OFF, LIMIT_TYPE_DEPOSIT } from "../../modules/Limits/limitConstants";
import { http } from "../../services/api/http";
import { useUserInfo } from "./userInfo";

interface ILimitAccount {
    "currency": string;
    "amount_cents": number;
    "current_value_amount_cents": number;
    "active_until": string;
}

interface IUserLimit {
    "period": string;
    "status": string;
    "disable_at": string | null;
    "confirm_until": string | null;
    "parent_type": string | null;
    "strategy": string | null;
    "created_at": string | null;
    "id": number;
    "type": string;
    "accounts": ILimitAccount[];
}

export const useUserLimits = defineStore("userLimits", () => {
    const limits = ref<IUserLimit[]>([]);

    // @ts-expect-error No overload matches this call.
    const getLimitsByType = computed<IUserLimit[]>(() => {
        return (type: string): IUserLimit[] => {
            return limits.value.filter((limitItem: IUserLimit) => {
                return limitItem.type === type;
            });
        };
    });

    const isOneLimitReached = computed<boolean>(() => {
        const specialType = [ LIMIT_TYPE_COOLING_OFF ];
        const { getUserCurrency: userCurr } = storeToRefs(useUserInfo());

        return Boolean(limits.value.length) && limits.value.some((limit) => {
            if (specialType.includes(limit.type)) {
                return true;
            }

            return limit.accounts?.some((acc) => {
                return limit.type !== LIMIT_TYPE_DEPOSIT &&
                  // @ts-expect-error This comparison appears to be unintentional
                  acc.currency === userCurr &&
                    acc.amount_cents - Math.abs(acc.current_value_amount_cents) <= 0;
            });
        });
    });

    const hasDepositLimit = computed<boolean | undefined>(() => {
        const { getUserCurrency: userCurr } = storeToRefs(useUserInfo());
        return Boolean(limits.value.length) && limits.value.some((limit) => {
            return limit.accounts?.some((acc) => {
                return limit.type === LIMIT_TYPE_DEPOSIT &&
                  // @ts-expect-error This comparison appears to be unintentional
                  acc.currency === userCurr &&
                    acc.amount_cents - Math.abs(acc.current_value_amount_cents) <= 0;
            });
        });
    });

    const hasSomeReachedLimit = computed<boolean>(() => {
        const specialType = [ LIMIT_TYPE_COOLING_OFF ];

        return Boolean(limits.value.length) && limits.value.some((limit) => {
            if (specialType.includes(limit.type)) {
                return true;
            }
            return limit.accounts?.some((acc) => {
                return acc.amount_cents - Math.abs(acc.current_value_amount_cents) <= 0;
            });
        });
    });

    async function loadUserLimits(): Promise<void> {
        try {
            const { data } = await http().get("/api/user_limits");
            limits.value = data;
            return data;
        } catch (err) {
            log.error("LOAD_USER_LIMITS", err);
        }
    }

    async function createNewUserLimit(dataLimit: IUserLimit): Promise<void> {
        try {
            await http().post("/api/user_limits", dataLimit);
            return await loadUserLimits();
        } catch (err) {
            log.error("CREATE_NEW_USER_LIMIT", err);
            throw err;
        }
    }

    async function updateUserLimit(dataLimit: IUserLimit): Promise<void> {
        try {
            await http().post("/api/user_limits", dataLimit);
            return await loadUserLimits();
        } catch (err) {
            log.error("UPDATE_USER_LIMIT", err);
            throw err;
        }
    }

    async function deleteUserLimit(limitId: number): Promise<void> {
        try {
            await http().delete(`/api/user_limits/${ limitId }`);
            return await loadUserLimits();
        } catch (err) {
            log.error("DELETE_USER_LIMIT", err);
            throw err;
        }
    }

    async function confirmUserLimitChange(token: string): Promise<void> {
        try {
            return await http().post("/api/user_limits/confirm", { token });
        } catch (err) {
            log.error("CONFIRM_USER_LIMIT_CHANGE", err);
            throw err;
        }
    }

    function clearState() {
        limits.value = [];
    }

    return {
        limits,

        getLimitsByType,
        isOneLimitReached,
        hasDepositLimit,
        hasSomeReachedLimit,

        clearState,
        loadUserLimits,
        createNewUserLimit,
        updateUserLimit,
        deleteUserLimit,
        confirmUserLimitChange,
    };
});
