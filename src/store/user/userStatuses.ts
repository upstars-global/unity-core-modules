import { ALL_LEVELS, ID_GROUP_FOR_MULTI_ACC, TEST_GROUP_ID, VIP_STATUSES } from "@config/user-statuses";
import { STATUSES, VIP_CLUB_STATUSES } from "@config/vip-clubs";
import { isVipUser } from "@helpers/user";
import { defineStore, storeToRefs } from "pinia";
import { computed, ref } from "vue";

import type { IUserLevelInfo } from "../../models/levels";
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

    const getUserLevelInfo = computed<IUserLevelInfo | Record<string, unknown>>(() => {
        const levelsStore = useLevelsStore();
        const { id } = getUserInfo.value?.statuses?.find((group) => {
            return !Number(group.id);
        }) || {} as IUserLevelInfo;

        if (!id) {
            return {} as IUserLevelInfo;
        }

        return levelsStore.getLevelsById(id) as IUserLevelInfo;
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

    const isVip = computed<boolean>(() => {
        return isVipUser(getUserGroups.value);
        // return VIP_STATUSES.some((status) => getUserGroups.value.includes(status)); // TODO: move to king
    });

    const getUserLevelId = computed(() => {
        return ALL_LEVELS.find((level) => getUserGroups.value.includes(level));
    });

    const isDiamond = computed<boolean>(() => {
        return getUserGroups.value.includes(STATUSES.DIAMOND.id);
    });

    const userVipStatus = computed<string>(() => {
        const statusGroup = VIP_STATUSES.find((status) => getUserGroups.value.includes(status));

        // @ts-expect-error Type 'undefined' cannot be used as an index type
        return VIP_CLUB_STATUSES[statusGroup]; // TODO: move to king
    });

    // @ts-expect-error No overload matches this call.
    const userVipGroup = computed<number>(() => {
        return VIP_STATUSES.find((status) => getUserGroups.value.includes(status)); // TODO: move to king
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
        getUserLevelId,

        addUserToGroup,
        loadUserManager,
    };
});
