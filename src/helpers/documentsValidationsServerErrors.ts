type documentServerError = Record<string, string[]>

export function getFirstErrorMessage(errorData: documentServerError) {
    for (const key in errorData) {
        if (Array.isArray(errorData[key]) && errorData[key].length > 0) {
            return errorData[key][0].split(" ")[0].toUpperCase();
        }
    }
    return "Unknown error occurred";
}
