import { storeToRefs } from "pinia";

import { log } from "../controllers/Logger";
import { Currencies } from "../models/enums/currencies";
import { loadUserBalanceReq, selectUserWalletReq } from "../services/api/requests/player";
import { useUserBalance } from "../store/user/userBalance";
import { useUserInfo } from "../store/user/userInfo";
import { useUserLimits } from "../store/user/userLimits";

export function useUserBalanceService() {
    const { balance } = storeToRefs(useUserBalance());

    async function loadUserBalance() {
        try {
            balance.value = await loadUserBalanceReq();
        } catch (err) {
            log.error("LOAD_USER_BALANCE", err);
        }
    }

    async function selectUserWallet(currency: Currencies) {
        try {
            const { loadUserProfile } = useUserInfo();
            const { loadUserLimits } = useUserLimits();

            await selectUserWalletReq(currency);

            return Promise.allSettled([
                loadUserProfile({ reload: true }),
                loadUserLimits(),
                loadUserBalance(),
            ]);
        } catch (err) {
            log.error("SELECT_USER_WALLET", err);
        }
    }

    return {
        loadUserBalance,
        selectUserWallet,
    };
}
