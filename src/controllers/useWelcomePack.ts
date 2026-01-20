import { storeToRefs } from "pinia";
import { computed, watchEffect } from "vue";

import { wait } from "../helpers/functionsHelper";
import { useConfigStore } from "../store/configStore";
import { useUserInfo } from "../store/user/userInfo";
import { useUserStatuses } from "../store/user/userStatuses";
import { StagController } from "./StagController";

type StagIdWelcomePack = Record<string, boolean>;

export type IWaitingShowWelcomePack = Promise<StagIdWelcomePack | null>;

export const useWelcomePack = () => {
    const { getIsLogged, getDataIsLoaded } = storeToRefs(useUserInfo());
    const { $defaultProjectConfig: { WELCOME_PACK_STAG_ID } } = useConfigStore();

    const nameForWelcomePackByUserStatus = computed<StagIdWelcomePack | null>(() => {
        const { getUserStatuses } = useUserStatuses();
        return getUserStatuses.find(({ name }) => {
            return WELCOME_PACK_STAG_ID[name];
        })?.name || null;
    });

    const nameForWelcomePackByStagId = computed<StagIdWelcomePack | null>(() => {
        const stagInfo = StagController.getStagInfo();

        return (stagInfo?.stagId && WELCOME_PACK_STAG_ID[stagInfo.stagId]) ? stagInfo?.stagId : null;
    });

    const showWelcomePack = computed<StagIdWelcomePack | null>(() => {
        if (getIsLogged.value) {
            return nameForWelcomePackByUserStatus.value;
        }
        return nameForWelcomePackByStagId.value;
    });

    function waitingShowWelcomePack(): IWaitingShowWelcomePack {
        return new Promise((resolve) => {
            watchEffect(async () => {
                if (getDataIsLoaded.value) {
                    resolve(showWelcomePack.value);
                } else {
                    await wait(100);
                    return await waitingShowWelcomePack();
                }
            });
        });
    }

    return {
        showWelcomePack,
        waitingShowWelcomePack,
    };
};
