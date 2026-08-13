import { log } from "../controllers/Logger";

export function parseJson(json: string, errorMessage = "PARSE_JSON_ERROR", id: string = "") {
    try {
        return JSON.parse(json);
    } catch (error) {
        if (error instanceof Error && id) {
            error.message = `${error.message}. Snippet id: ${id}`;
        }

        log.error(errorMessage, error);
    }
}
