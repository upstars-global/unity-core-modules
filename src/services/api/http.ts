import fetchAdapter from "@vespaiach/axios-fetch-adapter";
import type { AxiosInstance, AxiosRequestConfig } from "axios";
import axios from "axios";
import axiosRetry from "axios-retry";

import { COOKIE_BY_LOCALE } from "../../consts/cookies_by_locales";
import log from "../../controllers/Logger";
import { isServer } from "../../helpers/ssrHelpers";
import { BUS_EVENTS, EventBus } from "../../plugins/EventBus";

const SERVER_TIMEOUT = 8000;
const CLIENT_TIMEOUT = 30000;
const RETRY_COUNT = 6;
const URL_PART_BEFORE_QUERY = 0;

const RETRY_CONDITION = {
    "Network Error": true,
    [`timeout of ${CLIENT_TIMEOUT}ms exceeded`]: true,
    "timeout of 1ms exceeded": true,
};

const timeout = isServer ? SERVER_TIMEOUT : CLIENT_TIMEOUT;

interface IHttpParams {
    headers?: Record<string, string>;
    locale?: string;
}

export function http({ headers, locale }: IHttpParams = {}): AxiosInstance {
    const params: AxiosRequestConfig = {
        baseURL: isServer ? "http://localhost:2004" : "/",
        timeout,
        headers: {
            "X-Requested-With": "XMLHttpRequest",
            ...(headers || {}),
        },
        adapter: fetchAdapter,

    };

    if (isServer && locale) {
        params.headers = {
            ...params.headers,
            Cookie: `locale=${ COOKIE_BY_LOCALE[locale] };`,
        };
    }

    const client: AxiosInstance = axios.create(params);
    client.defaults.transitional = {
        silentJSONParsing: true,
        forcedJSONParsing: true,
        clarifyTimeoutError: false,
    };
    client.interceptors.response.use((response) => {
        return response;
    }, (error) => {
        if (error.response?.status === 401) {
            EventBus.$emit(BUS_EVENTS.AUTH_ERROR);
        }

        if (error?.config?.url) {
            let apiLabel = error.config.url.replace("/api/", "").replace(/\//g, "_").toUpperCase();
            if (apiLabel.indexOf("?") > -1) {
                apiLabel = apiLabel.split("?")[URL_PART_BEFORE_QUERY];
            }
            log.error(`LOAD_${apiLabel}_ERROR`, error);
        }

        return Promise.reject(error);
    });

    if (!isServer) {
        axiosRetry(client, {
            retries: RETRY_COUNT,
            retryCondition: (error) => Object.hasOwnProperty.call(RETRY_CONDITION, error.message),
            retryDelay: axiosRetry.exponentialDelay,
            shouldResetTimeout: true,
        });
    }

    return client;
}
