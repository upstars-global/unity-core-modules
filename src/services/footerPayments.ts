import { ref } from "vue";

import { loadFooterPaymentsConfigReq } from "./api/requests/configs";

export function useFooterPayments() {
    const paymentsLogo = ref<string[]>([]);
    async function loadFooterPayments() {
        const data = await loadFooterPaymentsConfigReq();
        if (data) {
            // @ts-expect-error -- TS2339: Property 'payments' does not exist on type 'string[]'.
            paymentsLogo.value = data.payments;
        }
    }


    return {
        paymentsLogo,
        loadFooterPayments,
    };
}
