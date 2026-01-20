class ScriptLoadError extends Error {
    config: { url: string };
    response: { status: string | number };

    constructor(url: string, status: string | number = "failed_to_load") {
        super(`Failed to load script: ${url}`);
        this.config = { url };
        this.response = { status };
    }
}

export function wait(duration: number) {
    return new Promise((resolve) => {
        return setTimeout(resolve, duration);
    });
}

export function addScript(src: string, { defer = true, async = true } = {}, callback = () => {}) {
    if (typeof document === "undefined") {
        return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.async = async;
        script.defer = defer;
        script.type = "text/javascript";
        script.src = src;

        document.head.appendChild(script);

        script.onload = () => {
            callback();
            resolve();
        };
        script.onerror = () => {
            reject(new ScriptLoadError(src, "failed_to_load"));
        };
    });
}
