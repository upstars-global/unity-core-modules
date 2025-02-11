export function wait(duration: number) {
    return new Promise((resolve) => {
        return setTimeout(resolve, duration);
    });
}


export function addScript(src: string, { defer = true, async = true } = {}, callback = () => {}) {
    if (typeof document !== "undefined") {
        const script = document.createElement("script");
        script.async = async;
        script.defer = defer;
        script.type = "text/javascript";
        script.src = src;

        document.head.appendChild(script);

        script.onload = callback;
    }
}
