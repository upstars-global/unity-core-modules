export function debounce<TArgs extends unknown[]>(
    this: unknown,
    func: (this: unknown, ...args: TArgs) => unknown,
    ms = 200,
) {
    let timer: ReturnType<typeof setTimeout> | null = null;

    return (...args: TArgs) => {
        const onComplete = () => {
            func.apply(this, args);
            timer = null;
        };

        if (timer) {
            clearTimeout(timer);
        }

        timer = setTimeout(onComplete, ms);
    };
}
