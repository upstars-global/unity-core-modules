import type { INotification } from "../models/WSnotices";

export function parseNoticeText(data): { content: INotification["content"] | undefined } | { title: string } {
    try {
        const parseData = JSON.parse(data.title) as INotification["content"];
        return { content: parseData };
    } catch (err) {
        return { title: data.title };
    }
}
