import { log } from "../../../controllers/Logger";
import { TransactionMetricInfo } from "../DTO/cashbox";
import { http } from "../http";

export async function sendTransactionMetricReq(metric: TransactionMetricInfo) {
    try {
        return await http().post("/metrics/transaction-metric", metric);
    } catch ({ response }) {
        log.error("SEND_TRANSACTION_METRIC", response);
    }
}
