interface IPromiseMemoizerParams {
    // save callback result after promise resolving, false by default
    cacheResult?: boolean;
}

type PromiseMemoizerCallback<T> = T & {
    clearCache(): void;
}

type PromisedFunc<R> = () => Promise<R>;

// save callback promise to prevent multiple executing, use IPromiseMemoizerParams to customize behaviour
export function promiseMemoizer<R, T extends PromisedFunc<R> = PromisedFunc<R>>(
    promiseCallback: T,
    params: IPromiseMemoizerParams = {},
): PromiseMemoizerCallback<T> {
    const {
        cacheResult = false,
    } = params;

    let promise: Promise<R> | undefined = undefined;

    const wrapped = () => {
        if (!promise) {
            promise = new Promise((resolve, reject) => {
                promiseCallback().then((data) => {
                    if (!cacheResult) {
                        promise = undefined;
                    }
                    resolve(data);
                }).catch((err) => {
                    reject(err);
                });
            });
        }
        return promise;
    };
    wrapped.clearCache = () => {
        promise = undefined;
    };

    return wrapped as PromiseMemoizerCallback<T>;
}
