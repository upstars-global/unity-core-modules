import { storeToRefs } from "pinia";

import { log } from "../controllers/Logger";
import type { IVipProgress } from "../services/api/DTO/vipAdventuresDTO";
import { loadVipAdventuresConfigFile, loadVipStatusProgress } from "../services/api/requests/vipAdventures";
import { useVipAdventures } from "../store/user/vipAdventures";


export function useVipAdventuresService() {
    const {
        vipAdventuresFullConfig,
        vipAdventuresConfigFile,
        vipAdventuresVariables,
        userVipStatusProgress,
        userGroupForAdventure,
        isConfigLoaded,
    } = storeToRefs(useVipAdventures());

    async function loadVipProgress(): Promise<IVipProgress | void> {
        try {
            const statusProgress = await loadVipStatusProgress();

            userVipStatusProgress.value = statusProgress;
            return statusProgress;
        } catch (err) {
            log.error("LOAD_VIP_PROGRESS_ERROR", err);
        }
    }

    async function loadVipAdventuresConfig(): Promise<void> {
        try {
            if (vipAdventuresFullConfig.value) {
                isConfigLoaded.value = true;
                return;
            }

            const config = await loadVipAdventuresConfigFile();

            if (config) {
                vipAdventuresFullConfig.value = config;
            }
        } catch (err) {
            log.error("LOAD_VIP_ADVENTURES_CONFIG_ERROR", err);
        } finally {
            isConfigLoaded.value = true;
        }
    }

    return {
        loadVipProgress,
        loadVipAdventuresConfig,
    };
}
