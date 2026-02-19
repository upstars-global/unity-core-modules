import { storeToRefs } from "pinia";

import { isExistData } from "../helpers/isExistData";
import { useManagePages } from "../store/useManagePages";
import { loadManagePagesConfigReq } from "./api/requests/managePages";

export async function loadPagesConfig() {
    const managePagesStore = useManagePages();
    const { pageConfiguration } = storeToRefs(managePagesStore);

    if (isExistData(pageConfiguration.value)) {
        return;
    }

    const pageConfigurationResponse = await loadManagePagesConfigReq();

    if (!pageConfigurationResponse) {
        return;
    }

    managePagesStore.setPageConfiguration(pageConfigurationResponse);
}
