import { v4 as uuid } from "uuid";

import { log } from "../../../controllers/Logger";
import type { IUserInfo } from "../../../models/user";
import { IPlayerPayment } from "../DTO/cashbox";
import { BettingPlayerSettingsDTO, IPlayerStats, ISubscriptions, IUserAccount, IUserSettings } from "../DTO/playerDTO";
import { http } from "../http";

type IPlayerGroup = string | number | null;

export async function changePlayerGroup(groupForAdding?: IPlayerGroup, groupForRemoving?: IPlayerGroup) {
    try {
        const { data } = await http().post<void>(
            "/api/player/groups",
            {
                groups:
                    {
                        add: groupForAdding ? [ groupForAdding ] : [],
                        remove: groupForRemoving ? [ groupForRemoving ] : [],
                    },
            });

        return data;
    } catch (err) {
        log.error("ADD_PLAYER_TO_GROUP_ERROR", err);
    }
}

export async function loadPlayerPayments() {
    try {
        const { data } = await http().get<IPlayerPayment[]>(
            "/api/player/payments");
        return data as IPlayerPayment[];
    } catch (err) {
        log.error("LOAD_PAYMENTS_HISTORY_ERROR", err);
        throw err;
    }
}

export async function cancelWithdrawRequestByID(id: number) {
    try {
        const { data } = await http().post(
            `/api/player/payments/${id}/recall`);
        return data;
    } catch (err) {
        log.error("REMOVE_WITHDRAW_REQUEST_BY_ID", err);
        throw err;
    }
}

export async function loadUserBalanceReq(compatibility = false): Promise<IUserAccount[]> {
    try {
        const { data } = await http().get<IUserAccount[]>(
            "/api/player/accounts",
            {
                params: {
                    compatibility,
                },
            },
        );
        return data;
    } catch (err) {
        log.error("LOAD_USER_BALANCE_ERROR", err);
        throw err;
    }
}

export async function selectUserWalletReq(currency): Promise<void> {
    try {
        await http().post<IUserAccount>("/api/player/accounts", {
            currency,
        });
    } catch (err) {
        log.error("SELECT_USER_WALLET_ERROR", err);
        throw err;
    }
}

export async function putUserSubscriptionReq(data) {
    try {
        await http().put("/api/subscriptions", data);
    } catch (err) {
        log.error("PUT_USER_SUBSCRIPTIONS_ERROR", err);
        throw err;
    }
}

export async function loadUserProfileReq() {
    try {
        return await http().get<IUserInfo>("/api/player");
    } catch (err) {
        log.error("LOAD_USER_PROFILE_ERROR", err);
    }
}

export async function loadUserSettingsReq() {
    try {
        const { data } = await http().get<IUserSettings>("/api/player/settings");

        return data;
    } catch (err) {
        log.error("GET_USER_SETTINGS_ERROR", err);
    }
}

export async function sendUserDataReq(data) {
    try {
        return await http().patch("/api/player", data);
    } catch (err) {
        log.error("SEND_USER_DATA_ERROR", err);
        throw err;
    }
}

export async function restorePasswordRequestReq(payload) {
    try {
        const { data } = await http().post("/api/users/password", payload);
        return data;
    } catch (err) {
        log.error("RESTORE_PASSWORD_REQUEST_ERROR", err);
        throw err.response;
    }
}

export async function restorePasswordRestoreReq(payload) {
    try {
        const { data } = await http().put("/api/users/password", payload);
        return data;
    } catch (err) {
        log.error("RESTORE_PASSWORD_RESTORE_ERROR", err);
        throw err;
    }
}

export async function confirmPlayerReq(token: string) {
    try {
        return await http().get(`/api/users/confirmation?confirmation_token=${token}`);
    } catch (err) {
        log.error("CONFIRM_PLAYER_ERROR", err);
        throw err;
    }
}

export async function confirmEmailResendReg(dataForConfirm) {
    try {
        return await http().post("/api/users/confirmation", dataForConfirm);
    } catch (err) {
        log.error("CONFIRM_EMAIL_RESEND_ERROR", err);
        throw err;
    }
}

export async function updateAuthDetailsProvidersReq(data) {
    try {
        return await http().post("/api/auth_providers/update_details", data);
    } catch (err) {
        log.error("UPDATE_AUTH_DETAILS_PROVIDERS_ERROR", err);
        throw err;
    }
}

export async function loadFreshChatRestoreIdReq(id: string, project: string) {
    try {
        const { data } = await http().post("/restore-id/get", {
            data: {
                internalId: String(id),
                project,
            },
            requestId: uuid(),
            type: "Api.V1.RestoreId.Get",
        });

        return data;
    } catch (err) {
        log.error("LOAD_FRESHCHAT_RESTORE_ID_ERROR", err);
    }
}

export async function sendFreshChatRestoreIdReq(userId: string, restoreId: string, project: string) {
    try {
        await http().post("/restore-id/set", {
            data: {
                restoreId,
                internalId: String(userId),
                project,
            },
            requestId: uuid(),
            type: "Api.V1.RestoreId.Set",
        });
    } catch (err) {
        log.error("SET_FRESHCHAT_RESTORE_ID_ERROR", err);
    }
}

export async function loadUserSubscriptionsReq() {
    try {
        const { data } = await http().get<ISubscriptions>("/api/subscriptions");
        return data;
    } catch (err) {
        log.error("LOAD_USER_SUBSCRIPTIONS_ERROR", err);
    }
}

export async function loadUserStatsReq() {
    try {
        const { data } = await http().get<IPlayerStats>("api/player/stats");
        return data;
    } catch (err) {
        log.error("LOAD_USER_STATS_ERROR", err);
    }
}

export async function loadUserBettingBonuses() {
    try {
        const { data } = await http().get("/api/v2/bonuses");
        return data;
    } catch (err) {
        log.error("LOAD_USER_BETTING_BONUSES_ERROR", err);
    }
}

export async function loadPlayerFieldsInfoRequest() {
    try {
        const { data } = await http().get("/api/info/player_fields");

        return data;
    } catch (err) {
        log.error("LOAD_PLAYER_FIELDS_INFO", err);
        throw err;
    }
}

export async function loadBettingPlayerSettingsRequest(): Promise<BettingPlayerSettingsDTO | undefined> {
    try {
        const { data } = await http().get("/api/v2/settings");

        return data;
    } catch (err) {
        log.error("LOAD_BETTING_PLAYER_SETTINGS_REQUEST_ERROR", err);
    }
}
