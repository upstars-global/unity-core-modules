import { log } from "../controllers/Logger";

interface IPromiseMemoizerParams {
    // save callback result after promise resolving, false by default
    cacheResult?: boolean;
}

type PromiseMemoizerCallback<T> = T & {
    clearCache(): void;
}

type PromisedFunc<R> = () => Promise<R>;

type ResultData = {
    success: boolean;
    result?: unknown;
    error?: unknown;
};

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

const toResultObject = async(promise?: Promise<unknown>): Promise<ResultData> => {
    const _promise = promise ? promise : new Promise<void>((resolve) => resolve());

    try {
        const result = await _promise;
        return { success: true, result };
    } catch (error) {
        return { success: false, error };
    }
};

export const promiseAll = async(promises: Array<Promise<unknown>>) => {
    return Promise.all(promises.map(toResultObject))
        .then((values) => {
            for (let i = 0; i < values.length; ++i) {
                if (!values[i].success) {
                    log.error("PROMISE_ERROR", values[i].error);
                }
            }
        })
        .catch((error) =>
            log.error("PROMISE_ERROR", error));
};

export const loadStartData = (store: unknown) => {
    return [];
};
