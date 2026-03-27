import { defineStore } from "pinia";
import { ref } from "vue";

import { IReferralCodeDTO, IReferralCodesResponseDTO } from "../services/api/DTO/referralDTO";

export const useReferral = defineStore("referral", () => {
    const referralCodes = ref<IReferralCodeDTO[]>([]);
    const referralStatistic = ref<IReferralCodesResponseDTO["aggregated_data"]>({
        total_invited: 0,
        total_claimed: 0,
    });

    function setReferralCodes(codes: IReferralCodeDTO[]) {
        referralCodes.value = codes;
    }

    function setStatistics(stats: IReferralCodesResponseDTO["aggregated_data"]) {
        referralStatistic.value = { ...referralStatistic.value, ...stats };
    }

    function addReferralCode(code: IReferralCodeDTO) {
        referralCodes.value.push(code);
    }

    return {
        referralCodes,
        referralStatistic,
        setReferralCodes,
        setStatistics,
        addReferralCode,
    };
});
