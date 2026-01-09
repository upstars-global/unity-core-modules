import { log } from "../../../controllers/Logger";
import { type IUserLimit } from "../DTO/userLimits";
import { http } from "../http";

export async function loadUserLimitsReq(): Promise<IUserLimit[]> {
    try {
        const { data } = await http().get<IUserLimit[]>("/api/user_limits");
        return data;
    } catch (err) {
        log.error("LOAD_USER_LIMITS_REQ_ERROR", err);
        throw err;
    }
}

export async function createNewUserLimitReq(dataLimit: IUserLimit): Promise<void> {
    try {
        await http().post("/api/user_limits", dataLimit);
    } catch (err) {
        log.error("CREATE_NEW_USER_LIMIT_REQ_ERROR", err);
        throw err;
    }
}

export async function updateUserLimitReq(dataLimit: IUserLimit): Promise<void> {
    try {
        await http().post("/api/user_limits", dataLimit);
    } catch (err) {
        log.error("UPDATE_USER_LIMIT_REQ_ERROR", err);
        throw err;
    }
}

export async function deleteUserLimitReq(limitId: number): Promise<void> {
    try {
        await http().delete(`/api/user_limits/${ limitId }`);
    } catch (err) {
        log.error("DELETE_USER_LIMIT_REQ_ERROR", err);
        throw err;
    }
}

export async function confirmUserLimitChangeReq(token: string): Promise<void> {
    try {
        await http().post("/api/user_limits/confirm", { token });
    } catch (err) {
        log.error("CONFIRM_USER_LIMIT_CHANGE_REQ_ERROR", err);
        throw err;
    }
}
