import { ID_GROUP_FOR_PAIRED_ID, ID_GROUP_FOR_UNPAIRED_ID } from "@config/groupAB";
import { storeToRefs } from "pinia";

import { log } from "../controllers/Logger";
import { isApiError } from "../helpers/apiErrors";
import type { IPlayerFieldsInfo } from "../models/common";
import type { IDataForUpdatePass, ITwoFactorAuthData, IUserGameHistoryItem, IUserSession } from "../models/user";
import { useCommon } from "../store/common";
import { useGiftsStore } from "../store/gifts";
import { useUserDocuments } from "../store/user/userDocuments";
import { userGamesHistory } from "../store/user/userGamesHistory";
import { useUserInfo } from "../store/user/userInfo";
import { useUserSecurity } from "../store/user/userSecurity";
import { useUserStatuses } from "../store/user/userStatuses";
import { useUserVerificationSumsub } from "../store/user/userVerificationSumsub";
import { type UserCouponStatuses } from "./api/DTO/couponePromoCodes";
import { http } from "./api/http";
import { activeCouponReq } from "./api/requests/couponePromoCodes";
import { deleteDocument, loadDocuments, uploadDocuments } from "./api/requests/documents";
import { loadBettingPlayerSettingsRequest, loadPlayerFieldsInfoRequest } from "./api/requests/player";
import { getSumsubTokenReq } from "./api/requests/sumsub";
import { loadDepositGiftsData } from "./gifts";

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

    await userStatuses.changeUserToGroup(groupForAdding);
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

        const { data } = await http().get<IUserGameHistoryItem[]>("/api/player/games");

        userGamesHistoryStore.setGamesHistory(data);
    } catch (err) {
        log.error("LOAD_USER_GAMES_HISTORY", err);
    }
}

export async function setDepositBonusCode(code: string) {
    try {
        const userStore = useUserInfo();
        const { depositGiftsAll } = storeToRefs(useGiftsStore());

        await http().patch("/api/player/set_bonus_code", {
            deposit_bonus_code: code,
        });

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
        await http().delete("/api/player/clear_bonus_code");
        userStore.loadUserProfile({ reload: true });
        loadDepositGiftsData();
    } catch (err) {
        log.error("deleteDepositBonusCode", err);
    }
}

export async function useBonuses(data: { can_issue: boolean }) {
    try {
        const userStore = useUserInfo();
        await http().patch("/api/player/update_bonus_settings", data);
        userStore.loadUserProfile({ reload: true });
        return await loadDepositGiftsData();
    } catch (err) {
        log.error("useBonuses", err);
    }
}

export async function activateUserCoupon(code: string) {
    try {
        const { data } = await http().post<{ status: UserCouponStatuses }>("/api/bonuses/coupon", {
            coupon_code: code,
        });

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
        const { data } = await http().get<IUserSession[]>("/api/player/sessions");

        setUserActiveSessions(data);
    } catch (err) {
        log.error("USER_SESSIONS", err);
    }
}

export async function closeUserSessionById(sessionId: number): Promise<void> {
    try {
        await http().delete(`/api/player/sessions/${sessionId}`);
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
        return await http().put("/api/users", {
            user: {
                current_password,
                password,
                password_confirmation,
            },
        });
    } catch (err) {
        log.error("UPDATE_USER_PASSWORD", err);
        throw err;
    }
}

export async function loadTwoFactor(): Promise<ITwoFactorAuthData | null> {
    try {
        const { setTwoFactorData } = useUserSecurity();
        const { data, status } = await http().get<ITwoFactorAuthData>("/api/player/two_factor");
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
        const dataActive2FA = {
            two_factor: {
                otp_secret: twoFactorData.value.otp_secret,
                authentication_code: code,
            },
        };

        const { data } = await http().post<ITwoFactorAuthData>("/api/player/two_factor", dataActive2FA);

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
        const { data } = await http().delete("/api/player/two_factor", {
            data: {
                two_factor: {
                    authentication_code: code,
                },
            },
        });

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
