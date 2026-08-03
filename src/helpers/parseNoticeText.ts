import type { INotification } from "../models/WSnotices";

// @ts-expect-error -- TS7006: Parameter 'data' implicitly has an 'any' type.
export function parseNoticeText(data): { content: INotification["content"] | undefined } | { title: string } {
    try {
        const parseData = JSON.parse(data.title) as INotification["content"];
        return { content: parseData };
    } catch (err) {
        return { title: data.title };
    }
}
