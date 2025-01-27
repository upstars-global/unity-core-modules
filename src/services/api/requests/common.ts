import { log } from "../../../controllers/Logger";
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
