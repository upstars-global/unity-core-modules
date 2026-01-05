import { defineStore, storeToRefs } from "pinia";
import { computed, ref, toRefs } from "vue";

import { log } from "../../controllers/Logger";
import { currencyView } from "../../helpers/currencyHelper";
import { Currencies } from "../../models/enums/currencies";
import type { IGift } from "../../services/api/DTO/gifts";
import type { IUserAccount } from "../../services/api/DTO/playerDTO";
import { loadUserBalanceReq, selectUserWalletReq } from "../../services/api/requests/player";
import { loadUserProfile } from "../../services/user";
import { useCommon } from "../common";
import { useGiftsStore } from "../gifts";
import { useSettings } from "../settings";
import { useUserInfo } from "./userInfo";
import { useUserLimits } from "./userLimits";

const handleBets = "handle_bets";

export const useUserBalance = defineStore("userBalance", () => {
    const userStore = useUserInfo();
    const { getSubunitsToUnitsByCode } = useUserInfo();
    const { getUserCurrency } = storeToRefs(userStore);
    const {
        getCurrencyFiat,
        getCurrencyCrypto,
        isCryptoCurrency,
    } = toRefs(useCommon());
    const { isCryptoDomain } = storeToRefs(useSettings());

    const balance = ref<IUserAccount[]>([]);

    const userCurrency = computed<string>(() => {
        return getUserCurrency.value;
    });

    const userWallets = computed<IUserAccount[]>(() => balance.value.filter((walletItem) => {
        return walletItem.active;
    }));

    async function loadUserBalance() {
        try {
            balance.value = await loadUserBalanceReq();
        } catch (err) {
            log.error("LOAD_USER_BALANCE", err);
        }
    }

    async function selectUserWallet(currency: Currencies) {
        try {
            const { loadUserLimits } = useUserLimits();
            await selectUserWalletReq(currency);

            return Promise.all([
                loadUserProfile({ reload: true }),
                loadUserLimits(),
                loadUserBalance(),
            ]);
        } catch (err) {
            // @ts-expect-error 'err' is of type 'unknown'.
            return err.response.data;
        }
    }

    const getUserCashoutBalance = computed<number>(() => {
        const balanceSelectedCurrency = balance.value.find((item) => {
            return item.currency === userCurrency.value;
        });

        if (balanceSelectedCurrency) {
            return balanceSelectedCurrency.available_to_cashout_cents;
        }

        return 0;
    });

    const getUserRealBalanceNormalise = computed<string>(() => {
        return currencyView(
            getUserCashoutBalance.value,
            userCurrency.value,
            null,
            getSubunitsToUnitsByCode(userCurrency.value),
        ) as string;
    });

    const getUserBonusBalance = computed<number>(() => {
        return getUserCommonBalance.value - getUserCashoutBalance.value;
    });
    const getUserBonusBalanceNormalize = computed(() => {
        return currencyView(getUserBonusBalance.value,
            userCurrency.value, null,
            getSubunitsToUnitsByCode(userCurrency.value),
        ) as string;
    });

    const getUserCommonBalance = computed<number>(() => {
        const commonBalance = balance.value.find((item) => {
            return item.currency === userCurrency.value;
        }) as IUserAccount;
        return commonBalance?.amount_cents || 0;
    });

    const getUserCommonBalanceNormalize = computed<string>(() => {
        return currencyView(
            getUserCommonBalance.value || 0,
            userCurrency.value,
            null,
            getSubunitsToUnitsByCode(userCurrency.value),
        ) as string;
    });

    const hasUserFatWallets = computed<boolean>(() => {
        return userWallets.value.some(({ currency }) => {
            return !isCryptoCurrency.value(currency);
        });
    });

    const getUserTotalWagering = computed<number | string>(() => {
        const giftStore = useGiftsStore();

        return giftStore.giftsAll.reduce((accum: number, gift): number => {
            if (
                (gift as IGift).currency === userCurrency.value &&
                (gift as IGift).stage === handleBets &&
                (gift as IGift).amount_wager_requirement_cents
            ) {
                return accum + (gift as IGift).amount_wager_requirement_cents;
            }
            return accum;
        }, 0);
    });

    const getUserWager = computed(() => {
        const giftStore = useGiftsStore();

        return giftStore.giftsAll.reduce((accum: number, gift) => {
            if (
                (gift as IGift).currency === userCurrency.value &&
                (gift as IGift).stage === handleBets &&
                (gift as IGift).amount_wager_cents
            ) {
                return accum + (gift as IGift).amount_wager_cents;
            }
            return accum;
        }, 0);
    });

    const getCurrencies = computed(() => {
        return [
            ...(!isCryptoDomain.value || hasUserFatWallets.value ? getCurrencyFiat.value : []),
            ...getCurrencyCrypto.value,
        ];
    });

    // @ts-expect-error Binding element 'data' implicitly has an 'any' type.
    function updateUserBalance({ data }) {
        const newBalanceArray = [ ...balance.value ];
        const indexUpdateCurrencyBalance = newBalanceArray.findIndex(({ currency }) => currency === data.currency);
        newBalanceArray[indexUpdateCurrencyBalance] = data;
        balance.value = newBalanceArray;
    }

    function clearState() {
        balance.value = [];
    }

    return {
        clearState,

        userCurrency,
        balance,
        userWallets,
        loadUserBalance,
        selectUserWallet,

        updateUserBalance,

        getUserCashoutBalance,
        getUserRealBalanceNormalise,
        getUserBonusBalance,
        getUserBonusBalanceNormalize,
        getUserCommonBalance,
        getUserCommonBalanceNormalize,

        hasUserFatWallets,

        getUserTotalWagering,
        getUserWager,
        getCurrencies,
    };
});
