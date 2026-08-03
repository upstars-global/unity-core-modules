import { log } from "../controllers/Logger";

// @ts-expect-error -- TS7006: Parameter 'json' implicitly has an 'any' type.
export function parseJson(json, errorMessage = "PARSE_JSON_ERROR", id: string = "") {
    try {
        return JSON.parse(json);
    } catch (error) {
        if (error instanceof Error && id) {
            error.message = `${error.message}. Snippet id: ${id}`;
        }

        log.error(errorMessage, error);
    }
}
