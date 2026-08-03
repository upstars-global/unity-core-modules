// @ts-expect-error -- TS7006: Parameter 'func' implicitly has an 'any' type.
export function throttle(func, wait = 1000, immediate = true) {
    // @ts-expect-error -- TS7034: Variable 'timeout' implicitly has type 'any' in some locations where its type cannot be determined.
    let timeout = null;
    if (typeof func !== "function") {
        throw new TypeError("Expected a function");
    }

    // @ts-expect-error -- TS7019: Rest parameter 'args' implicitly has an 'any[]' type.
    return function(...args) {
        // @ts-expect-error -- TS2683: 'this' implicitly has type 'any' because it does not have a type annotation.
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const context = this;
        const later = function() {
            timeout = null;
            if (!immediate) {
                func.apply(context, args);
            }
        };
        // @ts-expect-error -- TS7005: Variable 'timeout' implicitly has an 'any' type.
        const callNow = immediate && !timeout;
        // @ts-expect-error -- TS7005: Variable 'timeout' implicitly has an 'any' type.
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) {
            func.apply(context, args);
        }
    };
}
