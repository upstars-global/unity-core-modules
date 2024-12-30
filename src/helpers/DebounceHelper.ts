export function debounce(func, ms = 200) {
    let timer = null;

    return (...args) => {
        const onComplete = () => {
            // eslint-disable-next-line no-invalid-this
            func.apply(this, args);
            timer = null;
        };

        if (timer) {
            clearTimeout(timer);
        }

        timer = setTimeout(onComplete, ms);
    };
}
