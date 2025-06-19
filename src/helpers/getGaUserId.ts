import { CookieController } from "../controllers/CookieController";

export function getGaUserId() {
    return CookieController.get("_ga")?.replace("GA1.1.", "");
}
