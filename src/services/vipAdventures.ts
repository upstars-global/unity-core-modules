import { storeToRefs } from "pinia";

import { log } from "../controllers/Logger";
import type { IVipProgress } from "../services/api/DTO/vipAdventuresDTO";
import { loadVipAdventuresConfigFile, loadVipStatusProgress } from "../services/api/requests/vipAdventures";
import { useVipAdventures } from "../store/user/vipAdventures";


export function useVipAdventuresService() {
    const {
        vipAdventuresConfigFile,
        vipAdventuresVariables,
        userVipStatusProgress,
        userGroupForAdventure,
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
            if (vipAdventuresConfigFile.value) {
                return;
            }

            const config = await loadVipAdventuresConfigFile();

            if (config) {
                vipAdventuresConfigFile.value = userGroupForAdventure.value
                    ? config.prizes[userGroupForAdventure.value]
                    : Object.values(config.prizes)[0];

                if (config.variables) {
                    vipAdventuresVariables.value = userGroupForAdventure.value
                        ? config.variables[userGroupForAdventure.value]
                        : Object.values(config.variables)[0];
                }
            }
        } catch (err) {
            log.error("LOAD_VIP_ADVENTURES_CONFIG_ERROR", err);
        }
    }

    return {
        loadVipProgress,
        loadVipAdventuresConfig,
    };
}
