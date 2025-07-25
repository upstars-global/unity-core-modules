import { log } from "../../../controllers/Logger";
import { Currencies } from "../../../models/enums/currencies";
import { IVipProgress } from "../DTO/vipAdventuresDTO";
import { loadVipAdventuresConfigReq } from "./configs";

export async function loadVipAdventuresConfigFile() {
    try {
        return await loadVipAdventuresConfigReq();
    } catch (err) {
        log.error("LOAD_VIP_ADVENTURES_CONFIG_FILE", err);
        throw err;
    }
}

export async function loadVipStatusProgress(): Promise<IVipProgress> {
    try {
        return {
            userId: 984902,
            currency: Currencies.EUR,
            currentStatus: "BRONZE",
            activeStatus: "BRONZE",
            nextStatus: "SILVER",
            depositAmountCents: 600100,
            depositThresholdCents: 1200000,
            betSumCents: 6000100,
            betSumThresholdCents: 12000000,
            overallProgress: 0.5,
        };
    } catch (err) {
        log.error("LOAD_VIP_STATUS_PROGRESS", err);
        throw err;
    }
}
