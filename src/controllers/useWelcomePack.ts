import { WELCOME_PACK_STAG_ID } from "@theme/configs/stagConsts";
import { storeToRefs } from "pinia";
import { computed, watchEffect } from "vue";

import stagController from "../controllers/StagController";
import { wait } from "../helpers/functionsHelper";
import { useUserInfo } from "../store/user/userInfo";
import { useUserStatuses } from "../store/user/userStatuses";

type StagIdWelcomePack = keyof typeof WELCOME_PACK_STAG_ID;

export type IWaitingShowWelcomePack = Promise<StagIdWelcomePack | null>;

export const useWelcomePack = () => {
    const { getIsLogged, getDataIsLoaded } = storeToRefs(useUserInfo());

    const nameForWelcomePackByUserStatus = computed<StagIdWelcomePack | null>(() => {
        const { getUserStatuses } = useUserStatuses();
        return getUserStatuses.find(({ name }) => {
            return WELCOME_PACK_STAG_ID[name];
        })?.name || null;
    });

    const nameForWelcomePackByStagId = computed<StagIdWelcomePack | null>(() => {
        const stagInfo = stagController.getStagInfo();

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
