
import { isServer } from "./ssrHelpers";

export function getUrlSearchParams() {
    if (isServer) {
        return;
    }

    return new URLSearchParams(window.location.search);
}
