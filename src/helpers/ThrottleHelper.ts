export function throttle<TArgs extends unknown[], TThis>(
    func: (this: TThis, ...args: TArgs) => unknown,
    wait = 1000,
    immediate = true,
) {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    if (typeof func !== "function") {
        throw new TypeError("Expected a function");
    }

    return function(this: TThis, ...args: TArgs) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const context = this;
        const later = function() {
            timeout = null;
            if (!immediate) {
                func.apply(context, args);
            }
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout!);
        timeout = setTimeout(later, wait);
        if (callNow) {
            func.apply(context, args);
        }
    };
}
