import log from "../controllers/Logger";

export function parseJson(json, errorMessage = "PARSE_JSON_ERROR") {
    try {
        return JSON.parse(json);
    } catch (error) {
        log.error(errorMessage, error);
    }
}
