import { useUserInfo } from "@store/user/userInfo";
import { useUserStatuses } from "@store/user/userStatuses";
import { storeToRefs } from "pinia";
import { computed, watchEffect } from "vue";

import stagController from "../controllers/StagController";
import { wait } from "../helpers/functionsHelper";

const stagIdForWelcomePack: Record<string, boolean> = {
    131811: true,
} as const;

type StagIdWelcomePack = keyof typeof stagIdForWelcomePack;

export type IWaitingShowWelcomePack = Promise<StagIdWelcomePack | null>;

export const useWelcomePack = () => {
    const { getIsLogged, getDataIsLoaded } = storeToRefs(useUserInfo());

    const nameForWelcomePackByUserStatus = computed<StagIdWelcomePack | null>(() => {
        const { getUserStatuses } = useUserStatuses();
        return getUserStatuses.find(({ name }) => {
            return stagIdForWelcomePack[name];
        })?.name || null;
    });

    const nameForWelcomePackByStagId = computed<StagIdWelcomePack | null>(() => {
        const stagInfo = stagController.getStagInfo();

        return (stagInfo?.stagId && stagIdForWelcomePack[stagInfo.stagId]) ? stagInfo?.stagId : null;
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
