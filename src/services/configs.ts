import { useCommon } from "../store/common";
import { loadExcludedPromoStagsReq } from "./api/requests/configs";

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
