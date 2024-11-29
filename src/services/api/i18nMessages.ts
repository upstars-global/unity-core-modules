import {http} from "./http";

export default {
    async loadMessages(locale: string): Promise<Object> {
        const timeStamp = Math.round(Date.now() / (1000 * 300));
        try {

            const { data } = await http().get<Object>(`/messages/${ locale }.json?t=${ timeStamp }`);
            return data;
        } catch (e) {
            console.error(e);
        }
    },
};
