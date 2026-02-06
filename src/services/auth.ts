import { type NavigationFailure } from "vue-router";

import ABTestController from "../controllers/ABTest/ABTestController";
import CoveryController from "../controllers/CoveryController";
import { log } from "../controllers/Logger";
import { IRespIbizaService } from "../models/common";
import { IUserFormData, IUserInfo } from "../models/user";
import { EventBus as bus } from "../plugins/EventBus";
import { useUserInfo } from "../store/user/userInfo";
import { checkEmail, registerUser, signIn, signOut } from "./api/requests/auth";
import { changeUserToGroup } from "./user";

export async function checkEmailVerify(email: string): Promise<IRespIbizaService> {
    return checkEmail(email);
}

type LoadAuthData = ({ route }?: { route?: string }) => Promise<void | IUserInfo>;

type ClearFreshChatUser = () => Promise<void>;

interface LoginTwoFactorDeps {
    loadAuthData: LoadAuthData;
}

interface LoginDeps extends LoginTwoFactorDeps {
    clearFreshChatUser: ClearFreshChatUser;
}

interface LogoutDeps {
    clearFreshChatUser: ClearFreshChatUser;
    resetAuthData(redirect?: string | undefined): Promise<void | NavigationFailure>;
}

interface RegistrationDeps {
    loadAuthData: LoadAuthData;
    enableABReg: boolean;
}

export function createLoginTwoFactor({ loadAuthData }: LoginTwoFactorDeps) {
    return async function loginTwoFactor(otp: string) {
        try {
            const { toggleUserIsLogged } = useUserInfo();
            const data = await signIn({ otp_attempt: otp });

            await loadAuthData();
            toggleUserIsLogged(true);

            return data;
            // @ts-expect-error Property 'response' does not exist on type 'unknown'
        } catch ({ response }) {
            log.error("LOGIN_TWO_FACTORS_ERROR", response);
            throw response.data;
        }
    };
}

export function createLogin({ loadAuthData, clearFreshChatUser }: LoginDeps) {
    return async function login(formData: IUserFormData & { route: string }) {
        try {
            const { email, password, captcha, route, custom_login_reg } = formData;
            const { toggleUserIsLogged } = useUserInfo();

            await clearFreshChatUser();

            const data = await signIn({
                email,
                password,
                dfpc: CoveryController.deviceFingerprint(),
                captcha,
                custom_login_reg,
            });

            await loadAuthData({ route });
            toggleUserIsLogged(true);

            return data;
        // @ts-expect-error Property 'response' does not exist on type 'unknown'
        } catch ({ response }) {
            log.error("LOGIN_ERROR", response);
            throw response;
        }
    };
}

export function createLogout({ clearFreshChatUser, resetAuthData }: LogoutDeps) {
    return async function logout(redirect: string) {
        try {
            await clearFreshChatUser();
            await signOut();
            await resetAuthData(redirect);
        // @ts-expect-error Property 'response' does not exist on type 'unknown'
        } catch ({ response }) {
            log.error("LOGOUT_ERROR", response);
        }
    };
}

export function createRegistration({ loadAuthData, enableABReg }: RegistrationDeps) {
    // @ts-expect-error arameter 'registrationData' implicitly has an 'any' type.
    return async function registration(registrationData) {
        if (registrationData.user) {
            registrationData.user.dfpc = CoveryController.deviceFingerprint();
        }

        try {
            const data = await registerUser(registrationData);
            const { setUserData, toggleUserIsLogged } = useUserInfo();

            setUserData(data);

            if (enableABReg) {
                await changeUserToGroup(ABTestController.groupById);
            }

            await loadAuthData();
            toggleUserIsLogged(true);

            bus.$emit("user.registration");

            return data;
            // @ts-expect-error Property 'response' does not exist on type 'unknown'
        } catch ({ response }) {
            log.error("REGISTRATION_ERROR", response);
            throw response;
        }
    };
}
