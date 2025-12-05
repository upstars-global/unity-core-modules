import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserVerificationSumsub = defineStore("UserVerificationSumsub", () => {
    const accessToken = ref<string>("");

    function setAccessToken(token: string) {
        accessToken.value = token;
    }

    return {
        accessToken,
        setAccessToken,
    };
});
