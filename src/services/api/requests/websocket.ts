import { log } from "../../../controllers/Logger";
import { IAuthData, IToken } from "../DTO/websocketDTO";
import { http } from "../http";

export async function loadWebsocketTokenReq() {
    try {
        const { data } = await http().post<IToken>("/api/v2/websocket/token");

        return data;
    } catch (err) {
        log.error("LOAD_BET_WEBSOCKET_TOKEN", err);
        throw err;
    }
}

export async function loadWebsocketAuthorizeReq(client: string, locale: string) {
    try {
        const { data } = await http().post<IAuthData>("/api/v2/websocket/authorize", {
            client: client.toString(),
            channels: [
                `$private:${locale}.platform_user.${client}`,
            ],
        });

        return data.channels;
    } catch (err) {
        log.error("LOAD_BET_WEBSOCKET_AUTHORIZE", err);
        throw err;
    }
}
