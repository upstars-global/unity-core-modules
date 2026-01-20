import { storeToRefs } from "pinia";

import { log } from "../controllers/Logger";
import { isApiError } from "../helpers/apiErrors";
import type { IPlayerFieldsInfo } from "../models/common";
import type { IDataForUpdatePass, ITwoFactorAuthData } from "../models/user";
import { useCommon } from "../store/common";
import { useConfigStore } from "../store/configStore";
import { useGiftsStore } from "../store/gifts";
import { useUserDocuments } from "../store/user/userDocuments";
import { userGamesHistory } from "../store/user/userGamesHistory";
import { useUserInfo } from "../store/user/userInfo";
import { useUserLimits } from "../store/user/userLimits";
import { useUserSecurity } from "../store/user/userSecurity";
import { useUserStatuses } from "../store/user/userStatuses";
import { useUserVerificationSumsub } from "../store/user/userVerificationSumsub";
import { type IUserLimit } from "./api/DTO/userLimits";
import { loadManagersConfigReq } from "./api/requests/configs";
import { activeCouponReq } from "./api/requests/couponePromoCodes";
import { deleteDocument, loadDocuments, uploadDocuments } from "./api/requests/documents";
import {
    activateTwoFactorReq,
    activateUserCouponReq,
    changePlayerGroup,
    closeUserSessionByIdReq,
    deleteDepositBonusCodeReq,
    deleteTwoFactorReq,
    IPlayerGroup,
    loadBettingPlayerSettingsRequest,
    loadPlayerFieldsInfoRequest,
    loadTwoFactorReq,
    loadUserActiveSessionsReq,
    loadUserGameHistoryReq,
    setDepositBonusCodeReq,
    updateBonusSettingsReq,
    updateUserPasswordReq,
} from "./api/requests/player";
import { getSumsubTokenReq } from "./api/requests/sumsub";
import {
    confirmUserLimitChangeReq,
    createNewUserLimitReq,
    deleteUserLimitReq,
    loadUserLimitsReq,
    updateUserLimitReq,
} from "./api/requests/userLimits";
import { loadDepositGiftsData } from "./gifts";

export async function userSetToGroupForAbTest() {
    const { $defaultProjectConfig } = useConfigStore();
    const { ID_GROUP_FOR_PAIRED_ID, ID_GROUP_FOR_UNPAIRED_ID } = $defaultProjectConfig;
    const userInfo = useUserInfo();
    const userStatuses = useUserStatuses();

    const isUserIncludingInAB = userStatuses.getUserGroups.some((id) => {
        return id === ID_GROUP_FOR_PAIRED_ID || id === ID_GROUP_FOR_UNPAIRED_ID;
    });
    if (isUserIncludingInAB) {
        return;
    }
    const groupForAdding = userInfo.info.id % 2 ? ID_GROUP_FOR_UNPAIRED_ID : ID_GROUP_FOR_PAIRED_ID;

    await changeUserToGroup(groupForAdding);
}

export async function loadPlayerFieldsInfo({ reload } = { reload: false }): Promise<IPlayerFieldsInfo | undefined> {
    const commonStore = useCommon();

    const { playerFieldsInfo } = storeToRefs(commonStore);

    if (playerFieldsInfo.value && !reload) {
        return playerFieldsInfo.value;
    }

    const data = await loadPlayerFieldsInfoRequest();

    if (data) {
        commonStore.setPlayerFieldsInfo(data);
    }
}

export async function loadBettingPlayerSettings() {
    try {
        const data = await loadBettingPlayerSettingsRequest();
        const { setBettingPlayerSettings } = useUserInfo();

        if (data) {
            setBettingPlayerSettings({
                oddsTypes: data.odds_types.available,
                selectedOddsType: data.odds_types.selected,
            });
        }
    } catch (error) {
        log.error("LOAD_BETTING_PLAYER_SETTINGS_ERROR", error);
    }
}

export async function loadSumsubToken(): Promise<string> {
    const { setAccessToken } = useUserVerificationSumsub();
    const response = await getSumsubTokenReq();

    if (response?.access_token) {
        setAccessToken(response.access_token);
    }

    return response?.access_token || "";
}


export async function loadUserDocs({ reload = false } = {}) {
    const userDocumentsStore = useUserDocuments();
    const { documents } = storeToRefs(userDocumentsStore);

    try {
        if (!reload && documents.value.length) {
            return documents.value;
        }

        const data = await loadDocuments();

        if (Array.isArray(data)) {
            userDocumentsStore.setDocuments(data);

            return data;
        }
    } catch (err) {
        log.error("LOAD_USER_DOCS_ERROR", err);
    }
}

export async function uploadUserDoc({ file, description }: { file: File, description: string }): Promise<void | Error> {
    try {
        await uploadDocuments(file, description);

        loadUserDocs({ reload: true });
    } catch (err) {
        log.error("UPLOAD_USER_DOC", err);
        throw err;
    }
}

export async function deleteUserDoc(id: string): Promise<void> {
    try {
        await deleteDocument(id);

        await loadUserDocs({ reload: true });
    } catch (err) {
        log.error("DELETE_USER_DOC", err);
    }
}

export async function loadUserGameHistory() {
    try {
        const userGamesHistoryStore = userGamesHistory();

        const data = await loadUserGameHistoryReq();

        userGamesHistoryStore.setGamesHistory(data);
    } catch (err) {
        log.error("LOAD_USER_GAMES_HISTORY", err);
    }
}

export async function setDepositBonusCode(code: string) {
    try {
        const userStore = useUserInfo();
        const { depositGiftsAll } = storeToRefs(useGiftsStore());

        await setDepositBonusCodeReq(code);

        userStore.loadUserProfile({ reload: true });

        await loadDepositGiftsData();

        return { promoIsValid: Boolean(depositGiftsAll.value.length) };
    } catch (err) {
        log.error("setDepositBonusCode", err);
    }
}

export async function deleteDepositBonusCode() {
    try {
        const userStore = useUserInfo();
        await deleteDepositBonusCodeReq();
        userStore.loadUserProfile({ reload: true });
        loadDepositGiftsData();
    } catch (err) {
        log.error("deleteDepositBonusCode", err);
    }
}

export async function useBonuses(data: { can_issue: boolean }) {
    try {
        const userStore = useUserInfo();
        await updateBonusSettingsReq(data);
        userStore.loadUserProfile({ reload: true });
        return await loadDepositGiftsData();
    } catch (err) {
        log.error("useBonuses", err);
    }
}

export async function activateUserCoupon(code: string) {
    try {
        const data = await activateUserCouponReq(code);

        return data.status;
    } catch (err) {
        log.error("activateUserCoupon", err);
    }
}

export async function activateBettingCoupon(code: string) {
    return await activeCouponReq(code);
}

export async function loadUserActiveSessions(): Promise<void> {
    try {
        const { setUserActiveSessions } = useUserSecurity();
        const data = await loadUserActiveSessionsReq();

        setUserActiveSessions(data);
    } catch (err) {
        log.error("USER_SESSIONS", err);
    }
}

export async function closeUserSessionById(sessionId: number): Promise<void> {
    try {
        await closeUserSessionByIdReq(sessionId);
        const userSecurityStore = useUserSecurity();
        const { userActiveSessions } = storeToRefs(userSecurityStore);

        const activeSessions = userActiveSessions.value
            .filter(({ id }) => id !== sessionId);

        userSecurityStore.setUserActiveSessions(activeSessions);
    } catch (err) {
        log.error("CLOSE_USER_SESSION", err);
        throw err;
    }
}

export async function updateUserPassword(
    { current_password, password, password_confirmation }: IDataForUpdatePass,
): Promise<unknown> {
    try {
        return await updateUserPasswordReq({
            current_password,
            password,
            password_confirmation,
        });
    } catch (err) {
        log.error("UPDATE_USER_PASSWORD", err);
        throw err;
    }
}

export async function loadTwoFactor(): Promise<ITwoFactorAuthData | null> {
    try {
        const { setTwoFactorData } = useUserSecurity();
        const { data, status } = await loadTwoFactorReq();
        if (status === 204) {
            return null;
        }
        setTwoFactorData(data);

        return data;
    } catch (err) {
        log.error("LOAD_TWO_FACTOR", err);
        throw err;
    }
}

export async function activateTwoFactor(code: string): Promise<ITwoFactorAuthData> {
    const { loadUserProfile } = useUserInfo();
    const userSecurityStore = useUserSecurity();
    const { twoFactorData } = storeToRefs(userSecurityStore);

    try {
        const data = await activateTwoFactorReq(
            twoFactorData.value,
            code,
        );

        userSecurityStore.setTwoFactorData(data);

        loadUserProfile({ reload: true });

        return data;
    } catch (err) {
        log.error("ACTIVATE_TWO_FACTOR", err);
        if (isApiError(err)) {
            throw err.response?.data;
        }
        throw err;
    }
}

export async function deleteTwoFactor(code: string): Promise<unknown> {
    const { loadUserProfile } = useUserInfo();

    try {
        const data = await deleteTwoFactorReq(code);

        loadUserProfile({ reload: true });

        return data;
    } catch (err) {
        log.error("DELETE_TWO_FACTOR_ERROR", err);
        if (isApiError(err)) {
            throw err.response?.data;
        }
        throw err;
    }
}

export async function changeUserToGroup(groupForAdding?: IPlayerGroup, groupForRemoving?: IPlayerGroup): Promise<void> {
    const userStore = useUserInfo();
    const { getUserGroups } = storeToRefs(useUserStatuses());

    if (!groupForAdding && !groupForRemoving) {
        log.error("CHANGE_PLAYER_GROUP_EMPTY_PARAMS", {
            groupForAdding: String(groupForAdding),
            groupForRemoving: String(groupForRemoving),
        });

        return;
    }

    if (groupForAdding === groupForRemoving) {
        log.error("CHANGE_PLAYER_GROUP_SAME_PARAMS", {
            groupForAdding: String(groupForAdding),
            groupForRemoving: String(groupForRemoving),
        });

        return;
    }

    const allowedToAddGroup = groupForAdding && !getUserGroups.value.includes(groupForAdding);
    const allowedToRemoveGroup = groupForRemoving && getUserGroups.value.includes(groupForRemoving);

    if (!allowedToAddGroup && !allowedToRemoveGroup) {
        return;
    }

    if (allowedToAddGroup) {
        userStore.addUserGroup({ id: groupForAdding, name: groupForAdding });
    }

    if (allowedToRemoveGroup) {
        userStore.removeUserGroup({ id: groupForRemoving, name: groupForRemoving });
    }

    await changePlayerGroup(
        allowedToAddGroup ? groupForAdding : null,
        allowedToRemoveGroup ? groupForRemoving : null,
    );
}

export async function loadUserManager() {
    const userStatusesStore = useUserStatuses();
    const { getUserManager, getUserGroups } = storeToRefs(userStatusesStore);

    if (getUserManager.value) {
        return getUserManager.value;
    }

    const manager = await loadManagersConfigReq(getUserGroups.value);

    if (manager) {
        userStatusesStore.setUserManager(manager);
    }

    return getUserManager.value;
}

export async function loadUserLimits() {
    const userLimitsStore = useUserLimits();

    try {
        const data = await loadUserLimitsReq();

        userLimitsStore.setUserLimits(data);

        return data;
    } catch (err) {
        log.error("LOAD_USER_LIMITS", err);
    }
}

export async function createNewUserLimit(dataLimit: IUserLimit) {
    try {
        await createNewUserLimitReq(dataLimit);
        return await loadUserLimits();
    } catch (err) {
        log.error("CREATE_NEW_USER_LIMIT", err);
        throw err;
    }
}

export async function updateUserLimit(dataLimit: IUserLimit) {
    try {
        await updateUserLimitReq(dataLimit);
        return await loadUserLimits();
    } catch (err) {
        log.error("UPDATE_USER_LIMIT", err);
        throw err;
    }
}

export async function deleteUserLimit(limitId: number) {
    try {
        await deleteUserLimitReq(limitId);
        return await loadUserLimits();
    } catch (err) {
        log.error("DELETE_USER_LIMIT", err);
        throw err;
    }
}

export async function confirmUserLimitChange(token: string): Promise<void> {
    try {
        return await confirmUserLimitChangeReq(token);
    } catch (err) {
        log.error("CONFIRM_USER_LIMIT_CHANGE", err);
        throw err;
    }
}

export async function resetActiveDepositGift() {
    const giftsStore = useGiftsStore();
    const { activeDepositGiftGroupID } = storeToRefs(giftsStore);

    if (activeDepositGiftGroupID.value) {
        await changeUserToGroup(null, activeDepositGiftGroupID.value);

        giftsStore.setActiveDepositGift(null);
    }
}
