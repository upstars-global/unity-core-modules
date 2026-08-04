import {
    ALL_LEVELS,
    ID_CASHBOX_ONBOARD_DONE,
    TEST_GROUP_ID,
// @ts-expect-error -- TS2307: Cannot find module '@config/user-statuses' or its corresponding type declarations.
} from "@config/user-statuses";
// @ts-expect-error -- TS2307: Cannot find module '@config/vip-clubs' or its corresponding type declarations.
import { VIP_CLUB_STATUSES } from "@config/vip-clubs";
// @ts-expect-error -- TS2307: Cannot find module '@helpers/user' or its corresponding type declarations.
import { getUserIsDiamond, getUserVipGroup } from "@helpers/user";
// @ts-expect-error -- TS2307: Cannot find module '@types/levels' or its corresponding type declarations.; TS6137: Cannot import type declaration files. Consider importing 'levels' instead of '@types/levels'.
import type { ILevel } from "@types/levels";
import { defineStore, storeToRefs } from "pinia";
import { computed, ref } from "vue";

import type { IUserStatus, UserGroup } from "../../models/user";
import { IVipManager } from "../../models/vipManagers";
import { useLevelsStore } from "../levels/levelsStore";
import { useUserInfo } from "./userInfo";

export const useUserStatuses = defineStore("userStatuses", () => {
    const userStore = useUserInfo();
    const { getUserInfo } = storeToRefs(userStore);
    const userManager = ref<IVipManager | null>(null);
    const socialNetworkAuthGroups = ref<number[]>([]);
    const availableBonuses = ref<boolean | null>(null);

    const getUserLevelInfo = computed<ILevel>(() => {
        const levelsStore = useLevelsStore();
        const { id } = getUserInfo.value?.statuses?.find((group) => {
            return !Number(group.id);
        }) || {} as IUserStatus;

        if (!id) {
            return {} as ILevel;
        }

        // @ts-expect-error -- TS2345: Argument of type 'string | number' is not assignable to parameter of type 'string'.
        return levelsStore.getLevelsById(id);
    });

    const getUserStatuses = computed<IUserStatus[]>(() => {
        return getUserInfo.value.statuses;
    });
    const getUserGroups = computed<UserGroup[]>(() => {
        return getUserStatuses.value.map((group: IUserStatus) => {
            return Number(group.id) || group.id;
        });
    });

    const isUserTester = computed<boolean>(() => {
        return getUserGroups.value.includes(TEST_GROUP_ID);
    });

    const isMultiAccount = computed<boolean>(() => {
        if (availableBonuses.value === null) {
            return false;
        }

        return !availableBonuses.value;
    });

    const userVipGroup = computed<string | undefined>(() => {
        return getUserVipGroup(getUserGroups.value);
    });

    const isVip = computed<boolean>(() => Boolean(userVipGroup.value));

    const userVipStatus = computed<string | null>(() => {
        return userVipGroup.value ? VIP_CLUB_STATUSES[userVipGroup.value] : null;
    });

    const getUserLevelId = computed(() => {
        // @ts-expect-error -- TS7006: Parameter 'level' implicitly has an 'any' type.
        return ALL_LEVELS.find((level) => getUserGroups.value.includes(level));
    });

    const isDiamond = computed<boolean>(() => {
        return getUserIsDiamond(userVipGroup.value);
    });

    const isRegisteredViaSocialNetwork = computed<boolean>(() => {
        return socialNetworkAuthGroups.value.some((status: number) => getUserGroups.value.includes(status));
    });

    const getUserManager = computed(() => {
        return userManager.value;
    });

    const isCashboxOnboardDone = computed(() => {
        return getUserGroups.value.includes(ID_CASHBOX_ONBOARD_DONE);
    });

    function setUserManager(manager: IVipManager) {
        userManager.value = manager;
    }

    function clearUserManager() {
        userManager.value = null;
    }

    function setSocialNetworkAuthGroups(groups: number[]) {
        socialNetworkAuthGroups.value = groups;
    }

    function setAvailableBonuses(value: boolean) {
        availableBonuses.value = value;
    }

    return {
        getUserLevelInfo,
        getUserStatuses,
        getUserGroups,
        isUserTester,
        isMultiAccount,
        isVip,
        isDiamond,
        isCashboxOnboardDone,
        userManager,
        getUserManager,
        setUserManager,
        userVipStatus,
        userVipGroup,
        isRegisteredViaSocialNetwork,
        getUserLevelId,
        setSocialNetworkAuthGroups,
        clearUserManager,
        setAvailableBonuses,
    };
});
