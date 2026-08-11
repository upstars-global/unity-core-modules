import { isServer } from "./ssrHelpers";

export async function normalizeCmsHtml(html = ""): Promise<string> {
    if (isServer) {
        const { parseFragment, serialize } = await import("parse5");

        return serialize(parseFragment(html));
    }

    return html;
}
