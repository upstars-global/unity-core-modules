import { useCommon } from "../store/common";
import { useConfigStore } from "../store/configStore";
import { useLevelsStore } from "../store/levels/levelsStore";
import {
    loadBettingConfigReq,
    loadCurrencyConfigReq,
    loadExcludedPromoStagsReq,
    loadMainWidgetConfigReq, loadVipProgramConfigReq,
} from "./api/requests/configs";

export async function loadExcludedPromoStags() {
    const commonStore = useCommon();

    if (commonStore.excludedPromoStags.length) {
        return commonStore.excludedPromoStags;
    }

    const data = await loadExcludedPromoStagsReq();

    if (data) {
        commonStore.setExcludedPromoStags(data);
    }
}

export async function loadCurrencyConfig() {
    const commonStore = useCommon();

    if (commonStore.currencyConfig) {
        return commonStore.currencyConfig;
    }

    const data = await loadCurrencyConfigReq();

    if (data) {
        commonStore.setCurrencyConfig(data);
    }
}

export async function loadMainWidgetConfig() {
    const commonStore = useCommon();
    const response = await loadMainWidgetConfigReq();

    if (response?.widgets) {
        commonStore.setMainWidgetConfig(response.widgets);
    }
}

export async function loadBettingConfig() {
    const configStore = useConfigStore();
    const config = await loadBettingConfigReq();

    if (config) {
        configStore.setBettingConfig(config);
    }
}

export async function loadVipProgramConfig() {
    const levelsStore = useLevelsStore();

    const data = await loadVipProgramConfigReq();

    if (data) {
        levelsStore.setConfigData(data);
    }
}

