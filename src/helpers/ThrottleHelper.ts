export function throttle(func, wait = 1000, immediate = true) {
    let timeout = null;
    if (typeof func !== "function") {
        throw new TypeError("Expected a function");
    }

    return function(...args) {
        // eslint-disable-next-line no-invalid-this,consistent-this,@typescript-eslint/no-this-alias
        const context = this;
        const later = function() {
            timeout = null;
            if (!immediate) {
                func.apply(context, args);
            }
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) {
            func.apply(context, args);
        }
    };
}
