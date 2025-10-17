export async function ensureStoreData<T>(
    value: T,
    fetcher: () => Promise<T>,
    reload?: boolean,
): Promise<T> {
    const isEmptyObject =
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value) &&
        Object.keys(value).length === 0;

    const hasData =
        value !== null &&
        value !== undefined &&
        !isEmptyObject &&
        (!Array.isArray(value) || value.length > 0);

    if (hasData && !reload) {
        return value;
    }

    return await fetcher();
}
