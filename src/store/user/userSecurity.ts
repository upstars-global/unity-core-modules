import { ref } from "vue";
import { defineStore } from "pinia";

import { useUserInfo } from "@store/user/userInfo";

import { http } from "../../services/api/http";
import log from "../../controllers/Logger";

interface IUserSession {
    "id": number;
    "ip": string;
    "country": string;
    "user_agent": string;
    "created_at": string;
    "current": boolean;
}

interface IDataForUpdatePass {
    current_password: string;
    password: string;
    password_confirmation: string;
}

interface ITwoFactorAuthData {
    otp_secret: string;
    data: string;
}

export const useUserSecurity = defineStore("userSecurity", () => {
    const userActiveSessions = ref<IUserSession[]>([]);

    async function loadUserActiveSessions(): Promise<void> {
        try {
            const { data } = await http().get("/api/player/sessions");

            userActiveSessions.value = data;
        } catch (err) {
            log.error("USER_SESSIONS", err);
        }
    }

    async function closeUserSessionById(sessionId: number): Promise<void> {
        try {
            await http().delete(`/api/player/sessions/${sessionId}`);
            userActiveSessions.value = userActiveSessions.value.filter(({ id }) => {
                return id !== sessionId;
            });
        } catch (err) {
            log.error("CLOSE_USER_SESSION", err);
            throw err;
        }
    }

    async function updateUserPassword(
        { current_password, password, password_confirmation }: IDataForUpdatePass,
    ): Promise<void> {
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

    const twoFactorData = ref<ITwoFactorAuthData | object>({});

    async function loadTwoFactor(): Promise<ITwoFactorAuthData | null> {
        try {
            const { data, status } = await http().get("/api/player/two_factor");
            if (status === 204) {
                return null;
            }
            twoFactorData.value = data;

            return data;
        } catch (err) {
            log.error("LOAD_TWO_FACTOR", err);
            throw err;
        }
    }

    async function activateTwoFactor(code: string): Promise<ITwoFactorAuthData | string> {
        const { loadUserProfile } = useUserInfo();

        try {
            const dataActive2FA = {
                two_factor: {
                    otp_secret: twoFactorData.value.otp_secret,
                    authentication_code: code,
                },
            };

            const { data } = await http().post("/api/player/two_factor", dataActive2FA);
            twoFactorData.value = data;

            loadUserProfile({ reload: true });

            return data;
        } catch (err) {
            log.error("ACTIVATE_TWO_FACTOR", err);
            throw err.response.data;
        }
    }

    async function deleteTwoFactor(code: string): Promise<void> {
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
            throw err.response.data;
        }
    }

    return {
        userActiveSessions,
        loadUserActiveSessions,
        closeUserSessionById,

        updateUserPassword,

        twoFactorData,
        loadTwoFactor,
        activateTwoFactor,
        deleteTwoFactor,
    };
});
