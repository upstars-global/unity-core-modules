import { http } from "./http";

export default {
    async loadMessages(locale: string): Promise<unknown> {
        const timeStamp = Math.round(Date.now() / (1000 * 300));
        try {
            const { data } = await http().get<object>(`/messages/${ locale }.json?t=${ timeStamp }`);
            return data;
        } catch (e) {
            console.error(e);
        }
    },
};
