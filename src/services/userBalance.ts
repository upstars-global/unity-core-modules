import { storeToRefs } from "pinia";

import { log } from "../controllers/Logger";
import { Currencies } from "../models/enums/currencies";
import { loadUserBalanceReq, selectUserWalletReq } from "../services/api/requests/player";
import { loadUserLimits, loadUserProfile } from "../services/user";
import { useUserBalance } from "../store/user/userBalance";

export function useUserBalanceService() {
    const { balance } = storeToRefs(useUserBalance());

    async function loadUserBalance() {
        try {
            balance.value = await loadUserBalanceReq();
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
