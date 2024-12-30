import { log } from "../../../controllers/Logger";
import type { IClientContext } from "../../../models/clientContext";
import { http } from "../http";

export async function getClientContext() {
    try {
        const { data }: {data: IClientContext} = await http().get<IClientContext>("/client-context");
        return data;
    } catch (err) {
        log.error("LOAD_CLIENT_CONTEXT_ERROR", err);
        throw err;
    }
}
