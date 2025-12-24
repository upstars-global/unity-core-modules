import { FE_API_PREFIX } from "../../../consts/apiConfig";
import { log } from "../../../controllers/Logger";
import { TransactionMetricInfo } from "../DTO/cashbox";
import { http } from "../http";

export async function sendTransactionMetricReq(metric: TransactionMetricInfo) {
    try {
        return await http().post(`${ FE_API_PREFIX }/metrics/transaction-metric`, metric);
    } catch ({ response }) {
        log.error("SEND_TRANSACTION_METRIC", response);
    }
}
