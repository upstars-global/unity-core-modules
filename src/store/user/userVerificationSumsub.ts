import { getSumsubTokenReq } from "../../services/api/requests/sumsub";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserVerificationSumsub = defineStore("UserVerificationSumsub", () => {
    const accessToken = ref<string>("");

    async function loadSumsubToken(): Promise<string> {
        const { access_token } = await getSumsubTokenReq();
        accessToken.value = access_token;
        return access_token;
    }

    return {
        accessToken,

        loadSumsubToken,
    };
});
