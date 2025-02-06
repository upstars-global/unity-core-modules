import type { AxiosError } from "axios";

import { log } from "../../../controllers/Logger";
import { IDocument } from "../DTO/documents";
import { http } from "../http";

export async function loadDocuments(): Promise<IDocument[] | Error> {
    try {
        const { data } = await http().get<IDocument[]>("/api/player/documents");
        return data;
    } catch (err) {
        log.error("LOAD_DOCUMENTS_ERROR", err);
        throw err;
    }
}

export async function uploadDocuments(file: File, description: string): Promise<IDocument[] | void> {
    try {
        const bodyFormData = new FormData();
        bodyFormData.append("document[attachment]", file);
        bodyFormData.append("document[description]", description);

        const { data } = await http().post("/api/player/documents", bodyFormData, {
            headers: {
                "Accept": "multipart/form-data",
                "Content-Type": "multipart/form-data",
            },
        });
        return data;
    } catch (err) {
        log.error("UPLOAD_DOCUMENTS_ERROR", err);
        throw (err as AxiosError).response;
    }
}

export async function deleteDocument(id: string): Promise<void> {
    try {
        await http().delete(`/api/player/documents/${ id }`);
    } catch (err) {
        log.error("DELETE_USER_DOC", err);
    }
}
