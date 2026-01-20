import { log } from "../../controllers/Logger";
import { isServer } from "../../helpers/ssrHelpers";
import { BUS_EVENTS, EventBus } from "../../plugins/EventBus";
import { useConfigStore } from "../../store/configStore";

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

interface RequestConfig {
    method?: string;
    headers?: Record<string, string>;
    body?: unknown;
    data?: unknown; // for axios compatibility
    timeout?: number;
    url?: string;
    params?: Record<string, unknown>;
}

interface HttpResponse<T = unknown> {
    data: T;
    status: number;
    statusText: string;
    headers: Headers;
    config: RequestConfig;
}

interface HttpError extends Error {
    response?: {
        status: number;
        statusText: string;
        data: unknown;
    };
    config?: RequestConfig;
}

class HttpClient {
    private readonly baseURL: string;
    private readonly defaultHeaders: Record<string, string>;
    private readonly timeout: number;
    private readonly responseInterceptors: Array<{
        fulfilled: (response: HttpResponse) => HttpResponse;
        rejected: (error: HttpError) => Promise<HttpError>;
    }> = [];

    constructor(config: { baseURL: string; timeout: number; headers: Record<string, string> }) {
        this.baseURL = config.baseURL;
        this.defaultHeaders = config.headers;
        this.timeout = config.timeout;
    }

    private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            return await fetch(url, {
                ...options,
                signal: controller.signal,
            });
        } catch (error) {
            if ((error as Error).name === "AbortError") {
                throw new Error(`timeout of ${this.timeout}ms exceeded`);
            }
            throw error;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    private async retryRequest(
        url: string,
        options: RequestInit,
        retries: number = RETRY_COUNT,
    ): Promise<Response> {
        let lastError: Error = new Error("Max retries exceeded");
        for (let i = 0; i <= retries; i++) {
            try {
                return await this.fetchWithTimeout(url, options);
            } catch (error) {
                lastError = error as Error;
                const shouldRetry = lastError.message in RETRY_CONDITION;

                if (i === retries || !shouldRetry) {
                    throw lastError;
                }

                const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }

        throw lastError;
    }

    private buildUrl(url: string): string {
        if (url.startsWith("http")) {
            return url;
        }

        // If baseURL is "/" (client-side), use relative URLs
        if (this.baseURL === "/") {
            return url.startsWith("/") ? url : `/${url}`;
        }

        // For server-side (localhost:2004), append the URL to baseURL
        return `${this.baseURL}${url.startsWith("/") ? url : `/${url}`}`;
    }

    private async parseResponse(response: Response): Promise<unknown> {
        if (response.status === 204) {
            return null;
        }

        const text = await response.text();

        if (!text) {
            return null;
        }

        try {
            return JSON.parse(text);
        } catch {
            return text;
        }
    }

    private async request<T = unknown>(config: RequestConfig): Promise<HttpResponse<T>> {
        let url = this.buildUrl(config.url || "");
        const headers = { ...this.defaultHeaders, ...config.headers };

        if (config.params) {
            const params = new URLSearchParams();
            for (const key of Object.keys(config.params)) {
                const value = config.params[key];
                if (value !== null && value !== undefined) {
                    params.append(key, String(value));
                }
            }
            const queryString = params.toString();
            if (queryString) {
                url = `${url }${url.includes("?") ? "&" : "?"}${queryString}`;
            }
        }

        let body: string | FormData | undefined = undefined;
        if (config.body || config.data) {
            const bodyData = config.body || config.data;
            if (bodyData instanceof FormData) {
                body = bodyData;
                const contentTypeKey = Object.keys(headers).find((key) => key.toLowerCase() === "content-type");
                if (contentTypeKey) {
                    delete headers[contentTypeKey];
                }
            } else {
                headers["Content-Type"] = headers["Content-Type"] || "application/json";
                body = JSON.stringify(bodyData);
            }
        }

        const options: RequestInit = {
            method: config.method || "GET",
            headers,
            body,
        };

        try {
            const response = isServer
                ? await this.fetchWithTimeout(url, options)
                : await this.retryRequest(url, options);

            const responseData = await this.parseResponse(response);
            const httpResponse: HttpResponse<T> = {
                data: responseData as T,
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
                config,
            };

            if (!response.ok) {
                const error = new Error(`HTTP ${response.status}: ${response.statusText}`) as HttpError;
                error.response = {
                    status: response.status,
                    statusText: response.statusText,
                    data: responseData,
                };
                error.config = config;
                throw error;
            }

            return this.applyResponseInterceptors(httpResponse);
        } catch (error) {
            const httpError = error as HttpError;
            httpError.config = config;
            throw await this.applyErrorInterceptors(httpError);
        }
    }

    private applyResponseInterceptors<T>(response: HttpResponse<T>): HttpResponse<T> {
        return this.responseInterceptors.reduce(
            (result, interceptor) => interceptor.fulfilled(result) as HttpResponse<T>,
            response,
        );
    }

    private async applyErrorInterceptors(error: HttpError): Promise<HttpError> {
        let result = error;
        for (const interceptor of this.responseInterceptors) {
            result = await interceptor.rejected(result);
        }
        return result;
    }

    get<T = unknown>(url: string, config?: Omit<RequestConfig, "method" | "url">): Promise<HttpResponse<T>> {
        return this.request<T>({ ...config, method: "GET", url });
    }

    post<T = unknown>(
        url: string,
        data?: unknown,
        config?: Omit<RequestConfig, "method" | "url" | "body">,
    ): Promise<HttpResponse<T>> {
        return this.request<T>({ ...config, method: "POST", url, body: data });
    }

    put<T = unknown>(
        url: string,
        data?: unknown,
        config?: Omit<RequestConfig, "method" | "url" | "body">,
    ): Promise<HttpResponse<T>> {
        return this.request<T>({ ...config, method: "PUT", url, body: data });
    }

    delete<T = unknown>(url: string, config?: Omit<RequestConfig, "method" | "url">): Promise<HttpResponse<T>> {
        return this.request<T>({ ...config, method: "DELETE", url });
    }

    patch<T = unknown>(
        url: string,
        data?: unknown,
        config?: Omit<RequestConfig, "method" | "url" | "body">,
    ): Promise<HttpResponse<T>> {
        return this.request<T>({ ...config, method: "PATCH", url, body: data });
    }

    get interceptors() {
        return {
            response: {
                use: (fulfilled: (response: HttpResponse) => HttpResponse, rejected: (error: HttpError) => Promise<HttpError>) => {
                    this.responseInterceptors.push({ fulfilled, rejected });
                },
            },
        };
    }

    get defaults() {
        return {
            transitional: {
                silentJSONParsing: true,
                forcedJSONParsing: true,
                clarifyTimeoutError: false,
            },
        };
    }
}

export function http({ headers, locale }: IHttpParams = {}): HttpClient {
    const { $defaultProjectConfig } = useConfigStore();
    const { COOKIE_BY_LOCALE } = $defaultProjectConfig;
    const clientHeaders: Record<string, string> = {
        "Accept": "application/json, text/plain, */*",
        "X-Requested-With": "XMLHttpRequest",
        ...(headers || {}),
    };

    if (isServer && locale) {
        clientHeaders.Cookie = `locale=${COOKIE_BY_LOCALE[locale]};`;
    }

    const client = new HttpClient({
        baseURL: isServer ? "http://localhost:2004" : "/",
        timeout,
        headers: clientHeaders,
    });

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

    return client;
}
