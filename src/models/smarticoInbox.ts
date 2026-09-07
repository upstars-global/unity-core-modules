export enum SmarticoInboxCategory {
    General = 0,
    Platform = 1,
    Personal = 2,
}

export enum SmarticoInboxReadStatus {
    UnreadOnly = 1,
    ReadOnly = 2,
}

export type SmarticoInboxReadFilter = "all" | "unread";

export interface ISmarticoInboxMessage {
    message_guid: string;
    sent_date: string;
    read: boolean;
    favorite: boolean;
    category_id?: SmarticoInboxCategory;
    expire_on_dt?: number;
}

export interface ISmarticoInboxButton {
    action: string;
    text: string;
}

export interface ISmarticoInboxMessageBody {
    title: string;
    preview_body: string;
    icon: string;
    action: string;
    html_body?: string;
    buttons?: ISmarticoInboxButton[];
    custom_data?: unknown;
}

export interface ISmarticoInboxMessagesParams {
    from?: number;
    to?: number;
    onlyFavorite?: boolean;
    categoryId?: SmarticoInboxCategory;
    read_status?: SmarticoInboxReadStatus;
    onUpdate?: (messages: ISmarticoInboxMessage[]) => void;
}

export interface ISmarticoInboxUnreadCountParams {
    onUpdate?: (unreadCount: number) => void;
}

export interface ISmarticoInboxActionResult {
    err_code: number;
    err_message: string;
}

export interface ISmarticoInboxApi {
    getInboxMessages(params?: ISmarticoInboxMessagesParams): Promise<ISmarticoInboxMessage[]>;
    getInboxMessageBody(messageGuid: string): Promise<ISmarticoInboxMessageBody>;
    getInboxUnreadCount(params?: ISmarticoInboxUnreadCountParams): Promise<number>;
    markInboxMessageAsRead(messageGuid: string): Promise<ISmarticoInboxActionResult>;
    markAllInboxMessagesAsRead(): Promise<ISmarticoInboxActionResult>;
}
