export function isExistData(value: unknown): boolean {
    const isEmptyObject =
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value) &&
        Object.keys(value).length === 0;

    return value !== null &&
        value !== undefined &&
        !isEmptyObject &&
        (!Array.isArray(value) || value.length > 0);
}
