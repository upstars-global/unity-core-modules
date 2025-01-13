export function inIframe(): boolean {
    if (typeof window === "undefined") {
        return false;
    }

    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

export enum PostMessagesType {
    close = "close",
    redirect = "redirect",
    refresh_user = "refresh_user"
}

interface IPostMessagePayload {
    url?: string;
    deeplink?: string;
}

interface IPostMessage {
    type: PostMessagesType;
    payload?: IPostMessagePayload;
}

export function sendPostMessageToParent(messageType: PostMessagesType, payload: IPostMessagePayload): void {
    const formInFrame = inIframe();

    if (formInFrame) {
        const message: IPostMessage = {
            type: messageType,
            ...(payload ? { payload } : {}),
        };

        window.parent.postMessage(message, "*");
    }
}
