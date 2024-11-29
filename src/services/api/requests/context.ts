import type { IClientContext } from "../../../models/clientContext";
import { http } from "../http";
import log from "../../../controllers/Logger";

export async function getClientContext() {
        try {
            const { data }: {data: IClientContext} = await http().get<IClientContext>("/client-context");
            return data;
        } catch (err) {
            log.error("LOAD_CLIENT_CONTEXT_ERROR", err);
            throw err;
        }
}
