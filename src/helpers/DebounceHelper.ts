// @ts-expect-error -- TS7006: Parameter 'func' implicitly has an 'any' type.
export function debounce(func, ms = 200) {
    // @ts-expect-error -- TS7034: Variable 'timer' implicitly has type 'any' in some locations where its type cannot be determined.
    let timer = null;

    // @ts-expect-error -- TS7019: Rest parameter 'args' implicitly has an 'any[]' type.
    return (...args) => {
        const onComplete = () => {
             
            // @ts-expect-error -- TS2683: 'this' implicitly has type 'any' because it does not have a type annotation.
            func.apply(this, args);
            timer = null;
        };

        // @ts-expect-error -- TS7005: Variable 'timer' implicitly has an 'any' type.
        if (timer) {
            clearTimeout(timer);
        }

        timer = setTimeout(onComplete, ms);
    };
}
