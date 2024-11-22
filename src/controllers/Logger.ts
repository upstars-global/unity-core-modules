/* eslint camelcase: ["error", {allow: ["level_name", "remote_addr"]}] */
/* eslint-disable no-console */

/* eslint-disable no-new */
class Logger {
    private $isServer: any;
    private $context: {};
    private callback: any;

    constructor(isServer, context, callback, scope) {
        this.$isServer = isServer;
        this.$context = Object.assign({}, context);
        this.callback = callback;

        let methods = Logger.getMethods();

        methods.map((method) => {
            scope[method] = (...args) => {
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

    processValue(obj) {
        let result = {};

        if (typeof obj === "object") {
            for (let name in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, name) && name !== "state") {
                    if (name[0] === "_") {
                        continue;
                    }

                    let value = obj[name];

                    if (typeof value === "string") {
                        result[name] = value;
                    } else {
                        result[name] = JSON.stringify(value);
                    }
                }
            }
        }

        return result;
    }

    handler(method, lab, err = {}) {
        let label = lab;
        let error = err;

        if (typeof label !== "string" && typeof error === "undefined") {
            error = label;
            label = "";
        }

        let obj = {
            label: label,
            level_name: method.toUpperCase(),
            remote_addr: this.$context.userIp,
            datetime: new Date().toISOString(),
            type: this.$context.type,
            rid: this.$context["x-request-id"],
            message: error.message,
        };

        if (error.response && error.response.data) {
            obj.phpError = this.processValue(error.response.data.error);
        }

        obj.context = this.processValue(this.$context);

        if (DEV) {
            if (err instanceof Error) {
                return err;
            }

            return new Error(err);
        }

        this.callback(obj);
    }
}

export default {
    init(config, callback) {
        new Logger(config.isServer, config.context, callback, this);
    },
};
