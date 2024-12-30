export function getErrorMessage(baseErrorMessage: string | string[] | Record<string, string>): string {
    if (typeof baseErrorMessage === "string") {
        return baseErrorMessage;
    }

    if (Array.isArray(baseErrorMessage)) {
        return baseErrorMessage[0];
    }

    return Object.values(baseErrorMessage)[0];
}
