import type { TInboxMessage, TInboxMessageBody } from "@smartico/public-api";

export type {
    InboxMarkMessageAction,
    SmarticoGlobal,
} from "@smartico/public-api";
export type { TInboxMessage, TInboxMessageBody };
export { InboxCategories, InboxReadStatus } from "@smartico/public-api";

export type SmarticoInboxReadFilter = "all" | "unread";
