import { useCommon } from "../store/common";
import { loadCurrencyConfigReq, loadExcludedPromoStagsReq, loadMainWidgetConfigReq } from "./api/requests/configs";

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
    const { widgets } = await loadMainWidgetConfigReq();
    if (widgets) {
        commonStore.setMainWidgetConfig(widgets);
    }
}
