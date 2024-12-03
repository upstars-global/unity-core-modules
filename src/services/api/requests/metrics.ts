import {
    IErrorsValidationForm,
    IFormErrorsCollection,
    IFormErrorsCollectionMetric,
    IMetricsErrorsValidationForm
} from "../DTO/metrics";
import { http } from "../http";
import log from "../../../controllers/Logger";
import { getUtmParamsFromCookies } from "@front/core/controllers/utmParams"; // TODO: change import
import { concatValues } from "../../../helpers/objectsHelpers";
import { getErrorMessage } from "../../../helpers/formErrorMessageHelper";
import type { IUtmMetrics } from "../../../models/utmMetrics";

function prepareErrorsForMetric(errorsCollection: IFormErrorsCollection): IFormErrorsCollectionMetric[] {
    const collectErrors: IFormErrorsCollectionMetric[] = [];
    Object.entries(errorsCollection)
        .forEach(([ key, messages ]) => {
            if (messages.length) {
                return collectErrors.push({ key, firstMessage: getErrorMessage(messages) });
            }
        });

    return collectErrors;
}

export async function sendMetricsErrorsValidationForm(data: IErrorsValidationForm) {
    try {
        const { side, component, errors } = data;
        await http().put<IMetricsErrorsValidationForm>("/metrics-errors-validation", {
            side,
            component,
            errors: prepareErrorsForMetric(errors),
        });
    } catch (err) {
        log.error("SEND_METRICS_ERRORS_VALIDATION_FORM_ERROR", err);
    }
}

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
        return await http().post("/log_utm_set", {
            utmMetrics,
        });
    } catch (err) {
        log.error("SEND_UTM_SET_METRICS", err);
    }
}

export async function sendUtmSendMetrics(utmMetrics: IUtmMetrics) {
    try {
        return await http().post("/log_utm_send", {
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

export function getUtmMetricsLogAction(actionType) {
    const actionsMap = {
        setUtm: sendUtmSetMetrics,
        sendUtm: sendUtmSendMetrics,
    };

    const utmParams: IUtmMetrics = getUtmParamsFromCookies();
    const utmValString = concatValues(utmParams);
    if (utmValString) {
        actionsMap[actionType](utmParams);
    }
}
