import { isExistData } from "../helpers/isExistData";
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

    if (isExistData(commonStore.currencyConfig)) {
        return commonStore.currencyConfig;
    }

    const data = await loadCurrencyConfigReq();

    if (data) {
        commonStore.setCurrencyConfig(data);
    }
}

export async function loadMainWidgetConfig() {
    const commonStore = useCommon();

    console.log("is Exist data:", isExistData(commonStore.widgetsConfig), commonStore.widgetsConfig);

    if (isExistData(commonStore.widgetsConfig)) {
        return commonStore.widgetsConfig;
    }

    const response = await loadMainWidgetConfigReq();

    if (response?.widgets) {
        commonStore.setMainWidgetConfig(response.widgets);
    }
}

export async function loadBettingConfig() {
    const configStore = useConfigStore();

    if (isExistData(configStore.bettingConfig)) {
        return configStore.bettingConfig;
    }

    const config = await loadBettingConfigReq();

    if (config) {
        configStore.setBettingConfig(config);
    }
}

export async function loadVipProgramConfig() {
    const configStore = useConfigStore();

    if (isExistData(configStore.vipProgramConfig)) {
        return configStore.vipProgramConfig;
    }

    const config = await loadVipProgramConfigReq();
    if (config) {
        configStore.setVipProgramConfig(config);
    }
}
