import { ID_GROUP_FOR_PAIRED_ID, ID_GROUP_FOR_UNPAIRED_ID } from "@config/groupAB";
import { PROJECT } from "@theme/configs/constantsFreshChat";
import { getStateByCounty } from "@theme/configs/stateFieldConfig";
import { storeToRefs } from "pinia";

import CoveryController from "../controllers/CoveryController";
import { cioIdentifyUser } from "../controllers/CustomerIO";
import { log } from "../controllers/Logger";
import { isApiError } from "../helpers/apiErrors";
import { EnumContextFields, EnumFormFields, type IPlayerFieldsInfo } from "../models/common";
import type { IDataForUpdatePass, ITwoFactorAuthData } from "../models/user";
import { EventBus as bus } from "../plugins/EventBus";
import { useCommon } from "../store/common";
import { useGiftsStore } from "../store/gifts";
import { useMultilangStore } from "../store/multilang";
import { useUserDocuments } from "../store/user/userDocuments";
import { userGamesHistory } from "../store/user/userGamesHistory";
import { useUserInfo } from "../store/user/userInfo";
import { useUserLimits } from "../store/user/userLimits";
import { useUserSecurity } from "../store/user/userSecurity";
import { useUserStatuses } from "../store/user/userStatuses";
import { useUserVerificationSumsub } from "../store/user/userVerificationSumsub";
import { type IUserLimit } from "./api/DTO/userLimits";
import { isHttpError } from "./api/http";
import { userAccessCheckReq } from "./api/requests/auth";
import { loadManagersConfigReq } from "./api/requests/configs";
import { activeCouponReq } from "./api/requests/couponePromoCodes";
import { deleteDocument, loadDocuments, uploadDocuments } from "./api/requests/documents";
import {
    activateTwoFactorReq,
    activateUserCouponReq,
    changePlayerGroup,
    closeUserSessionByIdReq,
    confirmEmailResendReg,
    confirmPlayerReq,
    deleteDepositBonusCodeReq,
    deleteTwoFactorReq,
    IPlayerGroup,
    leadPlayerStartSeasonInfoReq,
    loadBettingPlayerSettingsRequest,
    loadFreshChatRestoreIdReq,
    loadPlayerFieldsInfoRequest,
    loadTwoFactorReq,
    loadUserActiveSessionsReq,
    loadUserBettingBonuses,
    loadUserGameHistoryReq,
    loadUserProfileReq,
    loadUserSettingsReq,
    loadUserStatsReq,
    loadUserSubscriptionsReq,
    putUserSubscriptionReq,
    restorePasswordRequestReq,
    restorePasswordRestoreReq,
    sendFreshChatRestoreIdReq,
    sendUserDataReq,
    setDepositBonusCodeReq,
    updateAuthDetailsProvidersReq,
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
import { updateLocale } from "./localization";

export async function userSetToGroupForAbTest() {
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
        const { depositGiftsAll } = storeToRefs(useGiftsStore());

        await setDepositBonusCodeReq(code);

        loadUserProfile({ reload: true });

        await loadDepositGiftsData();

        return { promoIsValid: Boolean(depositGiftsAll.value.length) };
    } catch (err) {
        log.error("setDepositBonusCode", err);
    }
}

export async function deleteDepositBonusCode() {
    try {
        await deleteDepositBonusCodeReq();

        loadUserProfile({ reload: true });
        loadDepositGiftsData();
    } catch (err) {
        log.error("deleteDepositBonusCode", err);
    }
}

export async function useBonuses(data: { can_issue: boolean }) {
    try {
        await updateBonusSettingsReq(data);
        loadUserProfile({ reload: true });
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

export async function loadUserSubscriptions({ reload = false }) {
    const userInfoStore = useUserInfo();
    const { getUserInfo: info, getUserSubscriptions: subscriptions } = storeToRefs(userInfoStore);

    if (!reload && subscriptions.value) {
        return Promise.resolve(subscriptions.value);
    }

    const data = await loadUserSubscriptionsReq();

    if (data) {
        userInfoStore.setUserSubscriptions(data);
        userInfoStore.setUserInfo({ ...info.value, subscriptions: data });
    }

    return data;
}

// @ts-expect-error Parameter 'data' implicitly has an 'any' type.
export async function putUserSubscription(data) {
    await putUserSubscriptionReq(data);

    return loadUserSubscriptions({ reload: true });
}

export async function loadUserSettings() {
    const userInfoStore = useUserInfo();
    const data = await loadUserSettingsReq();

    if (data) {
        userInfoStore.setUserSettings(data);
    }

    return data;
}

// @ts-expect-error Parameter 'data' implicitly has an 'any' type.
export async function restorePasswordRequest(payload) {
    try {
        return await restorePasswordRequestReq(payload);
    } catch (err) {
        // @ts-expect-error 'err' is of type 'unknown'.
        throw err.response;
    }
}

// @ts-expect-error Parameter 'data' implicitly has an 'any' type.
export async function restorePasswordRestore(payload) {
    return await restorePasswordRestoreReq(payload);
}

export async function confirmPlayer(token: string) {
    const userInfoStore = useUserInfo();
    const { isUserTester } = storeToRefs(useUserStatuses());

    const response = await confirmPlayerReq(token);
    if (isUserTester.value) {
        userInfoStore.setUserData(response.data);
    }
    return response;
}

export async function confirmEmailResend(captcha: string) {
    const userInfoStore = useUserInfo();
    const { getUserInfo: info } = storeToRefs(userInfoStore);

    const dataForConfirm = {
        user: { email: info.value.email },
    };

    if (captcha) {
        // @ts-expect-error Property 'captcha' does not exist on type '{ email: string; }'
        dataForConfirm.user.captcha = captcha;
    }

    return await confirmEmailResendReg(dataForConfirm);
}

export async function sendFreshChatRestoreId(restoreId: string, project: string) {
    const userInfoStore = useUserInfo();
    const {
        getUserInfo: info,
        getFreshChatRestoreIdLoaded: freshchatRestoreIdLoaded,
        getFreshChatRestoreId: freshchatRestoreId,
    } = storeToRefs(userInfoStore);

    // to prevent override restore id when it is not initialized yet
    if (!freshchatRestoreIdLoaded.value || restoreId === freshchatRestoreId.value) {
        return;
    }

    userInfoStore.setFreshChatRestoreId(restoreId);
    userInfoStore.setFreshChatRestoreIdLoaded();

    await sendFreshChatRestoreIdReq(info.value.user_id, restoreId, project);
}

export async function loadUserStats() {
    const userInfoStore = useUserInfo();
    const data = await loadUserStatsReq();

    if (data) {
        userInfoStore.setPlayerStats(data);
    }

    return data;
}

export async function loadUserBonuses() {
    const userInfoStore = useUserInfo();
    const data = await loadUserBettingBonuses();

    if (data) {
        userInfoStore.setBettingBonuses(data);
    }
    return data;
}

export async function updateAuthDetailsProviders(data: { user: Record<string, unknown> }) {
    const userInfoStore = useUserInfo();
    const response = await updateAuthDetailsProvidersReq(data);

    if (response?.status === 201) {
        userInfoStore.setUserData(response.data);
    }

    return response;
}

export async function loadFreshChatRestoreId(project: string) {
    const userInfoStore = useUserInfo();
    const {
        getUserInfo: info,
    } = storeToRefs(userInfoStore);

    userInfoStore.setFreshChatRestoreIdLoaded(false);

    const data = await loadFreshChatRestoreIdReq(info.value.user_id, project);

    const restoreId = data?.data?.restoreId;

    if (restoreId) {
        userInfoStore.setFreshChatRestoreId(restoreId.trim());
    }

    userInfoStore.setFreshChatRestoreIdLoaded();
}

export async function sendUserData(data: Record<string, unknown>) {
    const userInfoStore = useUserInfo();
    const resp = await sendUserDataReq(data);

    userInfoStore.setUserInfoSavedFlag();

    await loadUserProfile({ reload: true });

    return resp;
}

export async function checkUserState() {
    const userInfoStore = useUserInfo();
    const { getUserInfo } = storeToRefs(userInfoStore);
    const useCommonStore = useCommon();

    const stateFieldConfig = useCommonStore.getFieldsType(EnumContextFields.edition, EnumFormFields.state);
    const userState = getUserInfo.value.state;
    const userPostCode = getUserInfo.value.postal_code;

    if (stateFieldConfig && !userState && userPostCode) {
        const stateForEdit = getStateByCounty(getUserInfo.value.country as string, userPostCode);

        if (stateForEdit) {
            await sendUserData({
                context: "edition",
                player: { state: stateForEdit },
            });
        }
    }
}

export async function loadUserProfile({ reload = false, route }: { reload?: boolean; route?: string } = {}) {
    const multilang = useMultilangStore();
    const userInfoStore = useUserInfo();
    const { getUserInfo: info } = storeToRefs(userInfoStore);

    const profile = info.value;

    if (profile.id && !reload) {
        cioIdentifyUser(profile);
        return { data: profile };
    }

    userInfoStore.updateUserInfo({ dataIsLoaded: false });

    try {
        const response = await loadUserProfileReq();
        if (response) {
            userInfoStore.setUserData(response.data);

            const responseLang = response.data.language;

            if (responseLang !== multilang.getUserLocale && response.data.id) {
                updateLocale({ lang: responseLang, route });
            }

            if (!response.data.id) {
                userInfoStore.setFreshChatRestoreIdLoaded();
                userInfoStore.toggleUserIsLogged(false);
                return;
            }

            userInfoStore.toggleUserIsLogged(true);

            bus.$emit("user.data.received");
            bus.$emit("user.login", response.data);
            cioIdentifyUser(response.data);

            loadFreshChatRestoreId(PROJECT);
            loadPlayerFieldsInfo({ reload: true }).then(checkUserState);
        }

        return response;
    } finally {
        userInfoStore.updateUserInfo({
            dataUserLoadedOneTime: true,
            dataIsLoaded: true,
        });
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

export async function userAccessCheck() {
    try {
        const userInfoStore = useUserInfo();
        const { getUserInfo } = storeToRefs(userInfoStore);

        const user = {
            email: getUserInfo.value?.email ?? null,
            phone: getUserInfo.value?.mobile_phone ?? null,
            first_name: getUserInfo.value?.first_name ?? null,
            last_name: getUserInfo.value?.last_name ?? null,
            country: getUserInfo.value?.country ?? null,
            dfpc: CoveryController.deviceFingerprint(),
        };

        const response = await userAccessCheckReq(user);

        return response;
    } catch (error) {
        if (isHttpError(error)) {
            return error.response;
        }
    }
}

export async function leadPlayerStartSeasonInfo() {
    const userInfo = useUserInfo();
    const { getIsLogged } = storeToRefs(userInfo);
    const { isVip } = storeToRefs(useUserStatuses());

    if (getIsLogged.value && isVip.value) {
        try {
            const data = await leadPlayerStartSeasonInfoReq();

            if (data) {
                userInfo.setUserSeasonStartPoints(data);
            }
        } catch (err) {
            log.error("PORTOFRANCO_VIP_STATUS_ERROR", err);
        }
    }
}
