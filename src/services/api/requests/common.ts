import { log } from "../../../controllers/Logger";
import type { ICurrentIP } from "../DTO/current-ip";
import { http } from "../http";

interface IContactMessage {
    contact: {
        email: string;
        content: string;
    };
}

export async function sendContactMessageReq(contact: IContactMessage) {
    try {
        return await http().post("/api/send_contact_message", contact);
    } catch ({ response }) {
        log.error("SEND_CONTACT_MESSAGE", response);
        throw response.data.errors;
    }
};

export async function fetchCurrentIPReq() {
    try {
        const { data } = await http().get<ICurrentIP>("/api/current_ip");
        return data;
    } catch ({ response }) {
        log.error("LOAD_CURRENT_IP_ERROR", response);
    }
};
