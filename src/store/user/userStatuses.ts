import {
    ALL_LEVELS,
    ID_GROUP_FOR_MULTI_ACC,
    PASSWORD_SET_GROUP_ID,
    SOCIAL_NETOWORK_AUTH_GROUPS,
    TEST_GROUP_ID,
} from "@config/user-statuses";
import { VIP_CLUB_STATUSES } from "@config/vip-clubs";
import { getUserIsDiamond, getUserVipGroup } from "@helpers/user";
import type { ILevel } from "@types/levels";
import { defineStore, storeToRefs } from "pinia";
import { computed, ref } from "vue";

import type { IUserStatus, UserGroup } from "../../models/user";
import { IVipManager } from "../../models/vipManagers";
import { loadManagersConfigReq } from "../../services/api/requests/configs";
import { addPlayerToGroup } from "../../services/api/requests/player";
import { useLevelsStore } from "../levels/levelsStore";
import { useUserInfo } from "./userInfo";

export const useUserStatuses = defineStore("userStatuses", () => {
    const userStore = useUserInfo();
    const { getUserInfo } = storeToRefs(userStore);

    const userManager = ref<IVipManager>();

    const getUserLevelInfo = computed<ILevel>(() => {
        const levelsStore = useLevelsStore();
        const { id } = getUserInfo.value?.statuses?.find((group) => {
            return !Number(group.id);
        }) || {} as IUserStatus;

        if (!id) {
            return {} as ILevel;
        }

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
        return getUserGroups.value.includes(ID_GROUP_FOR_MULTI_ACC);
    });

    const userVipGroup = computed<string | undefined>(() => {
        return getUserVipGroup(getUserGroups.value);
    });

    const isVip = computed<boolean>(() => Boolean(userVipGroup.value));

    const userVipStatus = computed<string | null>(() => {
        return userVipGroup.value ? VIP_CLUB_STATUSES[userVipGroup.value] : null;
    });

    const getUserLevelId = computed(() => {
        return ALL_LEVELS.find((level) => getUserGroups.value.includes(level));
    });

    const isDiamond = computed<boolean>(() => {
        return getUserIsDiamond(userVipGroup.value);
    });

    const isRegisteredViaSocialNetwork = computed<boolean>(() => {
        return (SOCIAL_NETOWORK_AUTH_GROUPS || []).some((status: number) => getUserGroups.value.includes(status));
    });

    const isSetPasswordGroup = computed(() => {
        return getUserGroups.value.includes(PASSWORD_SET_GROUP_ID);
    });

    const getUserManager = computed(() => {
        return userManager.value;
    });

    async function addUserToGroup(groupForAdding: string | number) {
        if (!getUserGroups.value.includes(groupForAdding)) {
            await addPlayerToGroup(groupForAdding);
            userStore.addUserGroup({ id: groupForAdding, name: "" });
        }
    }

    async function loadUserManager() {
        if (userManager.value) {
            return getUserManager.value;
        }
        userManager.value = await loadManagersConfigReq(getUserGroups.value);
        return userManager.value;
    }

    function clearUserManager() {
        userManager.value = null;
    }

    return {
        getUserLevelInfo,
        getUserStatuses,
        getUserGroups,
        isUserTester,
        isMultiAccount,
        isVip,
        isDiamond,
        getUserManager,
        userVipStatus,
        userVipGroup,
        isRegisteredViaSocialNetwork,
        isSetPasswordGroup,
        getUserLevelId,

        addUserToGroup,
        loadUserManager,
        clearUserManager,
    };
});
