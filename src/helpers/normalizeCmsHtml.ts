import { isServer } from "./ssrHelpers";

export async function normalizeCmsHtml(html: unknown): Promise<string> {
    if (typeof html !== "string") {
        return "";
    }

    if (isServer) {
        const { parseFragment, serialize } = await import("parse5");

        return serialize(parseFragment(html));
    }

    return html;
}
