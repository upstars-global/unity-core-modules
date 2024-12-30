import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { log } from "../../controllers/Logger";
import { http } from "../../services/api/http";

enum DocumentType {
    Identity = "identity",
    Address = "address",
    Deposit = "deposit",
    PaymentMethod = "payment_method",
}

enum DocumentStatuses {
    NotApproved = "not_approved",
}

interface IDocument {
    id: number;
    description: string | null;
    document_type: DocumentType;
    status: DocumentStatuses;
    created_at: "string";
    updated_at: "string";
    file_name: "string";
}

export const useUserDocuments = defineStore("userDocuments", () => {
    const documents = ref<IDocument[]>([]);

    const getHasNotApprovedDoc = computed<boolean>(() => {
        return documents.value.some((doc) => {
            return doc.status === DocumentStatuses.NotApproved;
        });
    });

    async function loadUserDocs({ reload = false } = {}) {
        try {
            if (!reload && documents.value.length) {
                return documents.value;
            }
            const { data } = await http().get("/api/player/documents");

            documents.value = data;
            return data;
        } catch (err) {
            log.error("LOAD_USER_DOCS_ERROR", err);
        }
    }

    async function uploadUserDoc({ file, description }) {
        const bodyFormData = new FormData();
        bodyFormData.append("document[attachment]", file);
        bodyFormData.append("document[description]", description);

        try {
            const response = await http().post("/api/player/documents", bodyFormData, {
                headers: {
                    "Accept": "multipart/form-data",
                    "Content-Type": "multipart/form-data",
                },
            });
            loadUserDocs({ reload: true });
            return response;
        } catch (err) {
            log.error("UPLOAD_USER_DOC", err);
        }
    }

    async function deleteUserDoc(id) {
        try {
            await http().delete(`/api/player/documents/${ id }`);
            return await loadUserDocs({ reload: true });
        } catch (err) {
            log.error("DELETE_USER_DOC", err);
        }
    }

    return {
        documents,
        loadUserDocs,
        uploadUserDoc,
        deleteUserDoc,
        getHasNotApprovedDoc,
    };
});
