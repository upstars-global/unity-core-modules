import { isArray } from "card-validator/dist/lib/is-array";

export function getErrorMessage(baseErrorMessage: string | string[] | Record<string, string>): string {
    if (typeof baseErrorMessage === "string") {
        return baseErrorMessage;
    }

    if (isArray(baseErrorMessage)) {
        return baseErrorMessage[0];
    }

    return Object.values(baseErrorMessage)[0];
}
