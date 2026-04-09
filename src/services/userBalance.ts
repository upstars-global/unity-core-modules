import { log } from "../controllers/Logger";
import { Currencies } from "../models/enums/currencies";
import { loadUserBalanceReq, selectUserWalletReq } from "../services/api/requests/player";
import { loadUserLimits, loadUserProfile } from "../services/user";
import { useConfigStore } from "../store/configStore";
import { useUserBalance } from "../store/user/userBalance";

export function useUserBalanceService() {
    const { setUserBalance } = useUserBalance();

    async function loadUserBalance() {
        try {
            const balanceData = await loadUserBalanceReq();
            const { $defaultProjectConfig } = useConfigStore();
            const disabledCurrencies = $defaultProjectConfig?.disabledCurrencies || [];
            const filteredBalanceData = balanceData
                .filter((balanceItem) => !disabledCurrencies.includes(balanceItem.currency));

            setUserBalance(filteredBalanceData);
        } catch (err) {
            log.error("SERVICE_LOAD_USER_BALANCE_ERROR", err);
        }
    }

    async function selectUserWallet(currency: Currencies) {
        try {
            await selectUserWalletReq(currency);

            return Promise.allSettled([
                loadUserProfile({ reload: true }),
                loadUserLimits(),
                loadUserBalance(),
            ]);
        } catch (err) {
            log.error("SERVICE_SELECT_USER_WALLET_ERROR", err);
        }
    }

    return {
        loadUserBalance,
        selectUserWallet,
    };
}
