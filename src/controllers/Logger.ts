/* eslint camelcase: ["error", {allow: [
    "level_name", "remote_addr", "http_status", "http_status_text",
    "request_url", "request_method", "request_duration_ms", "request_start_time", "is_ssr"
]}] */


 
interface ILoggerConfig {
    isServer: boolean;
    context: Record<string, unknown>;
}

interface ILogger {
    info(...args: unknown[]): void;
    warn(...args: unknown[]): void;
    error(...args: unknown[]): void;
    init(config: ILoggerConfig, callback: unknown): void;
}

class Logger {
    private $isServer: boolean;
    private $context: Record<string, unknown>;
    private callback: unknown;

    // @ts-expect-error -- TS7006: Parameter 'isServer' implicitly has an 'any' type.; TS7006: Parameter 'context' implicitly has an 'any' type.; TS7006: Parameter 'callback' implicitly has an 'any' type.; TS7006: Parameter 'scope' implicitly has an 'any' type.
    constructor(isServer, context, callback, scope) {
        this.$isServer = isServer;
        this.$context = Object.assign({}, context);
        this.callback = callback;

        const methods = Logger.getMethods();

        methods.map((method) => {
            // @ts-expect-error -- TS7019: Rest parameter 'args' implicitly has an 'any[]' type.
            scope[method] = (...args) => {
                // @ts-expect-error -- TS2556: A spread argument must either have a tuple type or be passed to a rest parameter.
                return this.handler(method, ...args);
            };
        });
    }

    static getMethods() {
        return [
            "info",
            "warn",
            "error",
        ];
    }

    // @ts-expect-error -- TS7006: Parameter 'obj' implicitly has an 'any' type.
    processValue(obj) {
        const result = {};

        if (typeof obj === "object") {
            for (const name in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, name) && name !== "state") {
                    if (name[0] === "_") {
                        continue;
                    }

                    const value = obj[name];

                    if (typeof value === "string") {
                        // @ts-expect-error -- TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
                        result[name] = value;
                    } else {
                        // @ts-expect-error -- TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
                        result[name] = JSON.stringify(value);
                    }
                }
            }
        }

        return result;
    }

    // @ts-expect-error -- TS7006: Parameter 'method' implicitly has an 'any' type.; TS7006: Parameter 'lab' implicitly has an 'any' type.
    handler(method, lab, err = {}) {
        let label = lab;
        let error = err;

        if (typeof label !== "string" && typeof error === "undefined") {
            error = label;
            label = "";
        }

        const obj = {
            label: label,
            level_name: method.toUpperCase(),
            remote_addr: this.$context.userIp,
            datetime: new Date().toISOString(),
            type: this.$context.type,
            rid: this.$context["x-request-id"],
            // @ts-expect-error -- TS2339: Property 'message' does not exist on type '{}'.
            message: error.message,
        };

        // @ts-expect-error -- TS2339: Property 'response' does not exist on type '{}'.
        if (error.response) {
            // @ts-expect-error -- TS2339: Property 'http_status' does not exist on type '{ label: any; level_name: any; remote_addr: unknown; datetime: string; type: unknown; rid: unknown; message: any; }'.; TS2339: Property 'response' does not exist on type '{}'.
            obj.http_status = error.response.status;
            // @ts-expect-error -- TS2339: Property 'http_status_text' does not exist on type '{ label: any; level_name: any; remote_addr: unknown; datetime: string; type: unknown; rid: unknown; message: any; }'.; TS2339: Property 'response' does not exist on type '{}'.
            obj.http_status_text = error.response.statusText;

            // @ts-expect-error -- TS2339: Property 'response' does not exist on type '{}'.
            if (error.response.data) {
                // @ts-expect-error -- TS2339: Property 'phpError' does not exist on type '{ label: any; level_name: any; remote_addr: unknown; datetime: string; type: unknown; rid: unknown; message: any; }'.; TS2339: Property 'response' does not exist on type '{}'.
                obj.phpError = this.processValue(error.response.data.error);
            }
        }

        // @ts-expect-error -- TS2339: Property 'config' does not exist on type '{}'.
        if (error.config) {
            // @ts-expect-error -- TS2339: Property 'request_url' does not exist on type '{ label: any; level_name: any; remote_addr: unknown; datetime: string; type: unknown; rid: unknown; message: any; }'.; TS2339: Property 'config' does not exist on type '{}'.
            obj.request_url = error.config.url;
            // @ts-expect-error -- TS2339: Property 'request_method' does not exist on type '{ label: any; level_name: any; remote_addr: unknown; datetime: string; type: unknown; rid: unknown; message: any; }'.; TS2339: Property 'config' does not exist on type '{}'.
            obj.request_method = error.config.method;

            // @ts-expect-error -- TS2339: Property 'config' does not exist on type '{}'.
            if (error.config.request_start_time) {
                // @ts-expect-error -- TS2339: Property 'request_duration_ms' does not exist on type '{ label: any; level_name: any; remote_addr: unknown; datetime: string; type: unknown; rid: unknown; message: any; }'.; TS2339: Property 'config' does not exist on type '{}'.
                obj.request_duration_ms = Date.now() - error.config.request_start_time;
                // @ts-expect-error -- TS2339: Property 'request_start_time' does not exist on type '{ label: any; level_name: any; remote_addr: unknown; datetime: string; type: unknown; rid: unknown; message: any; }'.; TS2339: Property 'config' does not exist on type '{}'.
                obj.request_start_time = error.config.request_start_time;
            }
        }

        // @ts-expect-error -- TS2339: Property 'is_ssr' does not exist on type '{ label: any; level_name: any; remote_addr: unknown; datetime: string; type: unknown; rid: unknown; message: any; }'.
        obj.is_ssr = this.$isServer;

        // @ts-expect-error -- TS2339: Property 'context' does not exist on type '{ label: any; level_name: any; remote_addr: unknown; datetime: string; type: unknown; rid: unknown; message: any; }'.
        obj.context = this.processValue(this.$context);

        if (DEV) {
            if (err instanceof Error) {
                return err;
            }

            // @ts-expect-error -- TS2769: No overload matches this call.
            return new Error(err);
        }

        // @ts-expect-error -- TS2571: Object is of type 'unknown'.
        this.callback(obj);
    }
}

export const log = {
    init(config, callback) {
        new Logger(config.isServer, config.context, callback, this);
    },
} as ILogger;

export default log; // TODO: remove this export after migration to named exports
