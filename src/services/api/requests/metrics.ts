import { FE_API_PREFIX } from "../../../consts/apiConfig";
import { log } from "../../../controllers/Logger";
import { getUtmParamsFromCookies } from "../../../controllers/utmParams";
import { getErrorMessage } from "../../../helpers/formErrorMessageHelper";
import { concatValues } from "../../../helpers/objectsHelpers";
import type { IUtmMetrics } from "../../../models/utmMetrics";
import {
    IErrorsValidationForm,
    IFormErrorsCollection,
    IFormErrorsCollectionMetric,
    IMetricsErrorsValidationForm,
} from "../DTO/metrics";
import { http } from "../http";

function prepareErrorsForMetric(errorsCollection: IFormErrorsCollection): IFormErrorsCollectionMetric[] {
    const collectErrors: IFormErrorsCollectionMetric[] = [];
    Object.entries(errorsCollection)
        .forEach(([ key, messages ]) => {
            if (messages.length) {
                // @ts-expect-error -- TS2322: Type 'string' is not assignable to type 'FormFields'.
                return collectErrors.push({ key, firstMessage: getErrorMessage(messages) });
            }
        });

    return collectErrors;
}

export async function sendMetricsErrorsValidationForm(data: IErrorsValidationForm) {
    try {
        const { side, component, errors } = data;
        await http().post<IMetricsErrorsValidationForm>(`${ FE_API_PREFIX }/metrics-errors-validation`, {
            side,
            component,
            errors: prepareErrorsForMetric(errors),
        });
    } catch (err) {
        log.error("SEND_METRICS_ERRORS_VALIDATION_FORM_ERROR", err);
    }
}

// @ts-expect-error -- TS7006: Parameter 'data' implicitly has an 'any' type.
export async function sendTransactionToCovery(data) {
    try {
        return await http().post("/api/users/transaction", data);
    } catch (err) {
        log.error("SEND_COVERY_TRANSACTION_ERROR", err);
        throw err;
    }
}

export async function sendUtmSetMetrics(utmMetrics: IUtmMetrics) {
    try {
        return await http().post(`${ FE_API_PREFIX }/log_utm_set`, {
            utmMetrics,
        });
    } catch (err) {
        log.error("SEND_UTM_SET_METRICS", err);
    }
}

export async function sendUtmSendMetrics(utmMetrics: IUtmMetrics) {
    try {
        return await http().post(`${ FE_API_PREFIX }/log_utm_send`, {
            utmMetrics,
        });
    } catch (err) {
        log.error("SEND_UTM_SEND_METRICS", err);
    }
}

export enum UtmMetricsActions {
    SET_UTM = "setUtm",
    SEND_UTM = "sendUtm",
}

// @ts-expect-error -- TS7006: Parameter 'actionType' implicitly has an 'any' type.
export function getUtmMetricsLogAction(actionType) {
    const actionsMap = {
        setUtm: sendUtmSetMetrics,
        sendUtm: sendUtmSendMetrics,
    };

    // @ts-expect-error -- TS2740: Type 'Record<string, string | undefined>' is missing the following properties from type 'IUtmMetrics': utm_source, utm_medium, utm_campaign, utm_content, and 2 more.
    const utmParams: IUtmMetrics = getUtmParamsFromCookies();
    const utmValString = concatValues(utmParams);
    if (utmValString) {
        // @ts-expect-error -- TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ setUtm: (utmMetrics: IUtmMetrics) => Promise<HttpResponse<unknown> | undefined>; sendUtm: (utmMetrics: IUtmMetrics) => Promise<Http
        actionsMap[actionType](utmParams);
    }
}

export default {};
