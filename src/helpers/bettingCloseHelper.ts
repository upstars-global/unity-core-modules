import { getBettingUrl } from "./bettingHelpers";
import { PostMessagesType, sendPostMessageToParent } from "./iframeHelpers";

export default function bettingClose($router) {
    const { query } = $router.currentRoute.value;
    if (query.path) {
        window.location = query.path;
        sendPostMessageToParent(PostMessagesType.redirect, { url: query.path });
        return;
    }

    const orenUrl = getBettingUrl();
    sendPostMessageToParent(PostMessagesType.redirect, { url: orenUrl });
    window.location = orenUrl;
}
