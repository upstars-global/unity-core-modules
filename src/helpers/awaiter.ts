export const awaiter = <T>(timeout: number, arg: T): Promise<T> => new Promise((resolve) => setTimeout(resolve, timeout, arg));
