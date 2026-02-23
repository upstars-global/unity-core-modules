import { storeToRefs } from "pinia";

import { isExistData } from "../helpers/isExistData";
import { useLogoStore } from "../store/logoStore";
import { loadLogoConfigReq } from "./api/requests/logo";

export async function loadLogoConfig() {
    const logoStore = useLogoStore();
    const { logoConfig } = storeToRefs(logoStore);

    if (isExistData(logoConfig.value)) {
        return;
    }

    const logoConfigResponse = await loadLogoConfigReq();

    if (!logoConfigResponse) {
        return;
    }

    logoStore.setLogoConfig(logoConfigResponse);
}
