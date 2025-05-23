import { ref } from "vue";

import { loadFooterPaymentsConfigReq } from "./api/requests/configs";

export function useFooterPayments() {
    const paymentsLogo = ref<string[]>([]);
    async function loadFooterPayments() {
        const data = await loadFooterPaymentsConfigReq();
        paymentsLogo.value = data.payments;
    }


    return {
        paymentsLogo,
        loadFooterPayments,
    };
}
