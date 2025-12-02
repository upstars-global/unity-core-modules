import { defineStore } from "pinia";
import { ref } from "vue";

import { type ITwoFactorAuthData, type IUserSession } from "../../models/user";

export const useUserSecurity = defineStore("userSecurity", () => {
    const userActiveSessions = ref<IUserSession[]>([]);
    const twoFactorData = ref<ITwoFactorAuthData | Record<PropertyKey, unknown>>({});

    function setUserActiveSessions(sessions: IUserSession[]) {
        userActiveSessions.value = sessions;
    }

    function setTwoFactorData(data: ITwoFactorAuthData | Record<PropertyKey, unknown>) {
        twoFactorData.value = data;
    }

    return {
        userActiveSessions,
        setUserActiveSessions,
        twoFactorData,
        setTwoFactorData,
    };
});
