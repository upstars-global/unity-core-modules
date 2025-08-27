import { wait } from "./functionsHelper";

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

export async function sendPostMessageToParent(
    messageType: PostMessagesType,
    payload: IPostMessagePayload,
    waitTime = 0,
): Promise<void> {
    const formInFrame = inIframe();

    if (formInFrame) {
        const message: IPostMessage = {
            type: messageType,
            ...(payload ? { payload } : {}),
        };
        console.log("postMessage", JSON.stringify(message, null, 2));
        window.parent.postMessage(message, "*");

        if (waitTime > 0) {
            await wait(waitTime);
        }
    }
}
