import { log } from "../../../controllers/Logger";
import { isTestHostname } from "../../../helpers/isTestHostname";
import type { ICurrentIP } from "../DTO/current-ip";
import type { PWAEvent } from "../DTO/PWAEvent";
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

export async function fetchCurrentIPReq(hostname: string = "") {
    try {
        const url = isTestHostname(hostname) ? "https://rocketplay.com" : "";
        const { data } = await http().get<ICurrentIP>(`${url}/api/current_ip`);
        return data;
    } catch ({ response }) {
        log.error("LOAD_CURRENT_IP_ERROR", response);
    }
};

export async function sendPWAEventReq(event: PWAEvent) {
    try {
        const { data } = await http().post("/api/pwa_events", { event });
        return data;
    } catch ({ response }) {
        log.error("SEND_PWA_EVENT_ERROR", response);
    }
};
