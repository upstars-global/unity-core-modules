import { FE_API_PREFIX } from "../../../consts/apiConfig";
import { log } from "../../../controllers/Logger";
import { IRespIbizaService } from "../../../models/common";
import { IUserFormData } from "../../../models/user";
import { http, isHttpError } from "../http";

export async function checkEmail(email: string) {
    try {
        const { data } = await http().post<IRespIbizaService>(`${ FE_API_PREFIX }/check-email`, { email });

        return data;
    } catch (error) {
        log.error("CHECK_EMAIL_VERIFY_ERROR", error);
        throw error;
    }
}

export async function signIn(user: IUserFormData) {
    try {
        const { data } = await http().post("/api/users/sign_in", {
            user,
        });

        return data;
    } catch (error) {
        log.error("SIGN_IN_ERROR", error);
        throw error;
    }
}

export async function signOut() {
    try {
        await http().delete("/api/users/sign_out");
    } catch (error) {
        log.error("LOGOUT_REQUEST_ERROR", error);
        throw error;
    }
}

export async function registerUser(registrationData: { user: IUserFormData }) {
    try {
        const { data } = await http().post("/api/users", registrationData);

        return data;
    } catch (error) {
        log.error("REGISTRATION_REQUEST_ERROR", error);
        throw error;
    }
}

export async function userAccessCheckReq(user: IUserFormData) {
    try {
        const response = await http()
            .post(`${FE_API_PREFIX}/users/access_check`, { user });

        return response;
    } catch (error) {
        log.error("COVERY_VERIFY_ERROR", error);
        throw error;
    }
}
