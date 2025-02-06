import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { log } from "../../controllers/Logger";
import { DocumentStatuses, IDocument } from "../../services/api/DTO/documents";
import { deleteDocument, loadDocuments, uploadDocuments } from "../../services/api/requests/documents";


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
            const data = await loadDocuments();
            if (Array.isArray(data)) {
                documents.value = data;
                return data;
            }
        } catch (err) {
            log.error("LOAD_USER_DOCS_ERROR", err);
        }
    }

    async function uploadUserDoc({ file, description }: { file: File, description: string }): Promise<void | Error> {
        try {
            await uploadDocuments(file, description);
            loadUserDocs({ reload: true });
        } catch (err) {
            log.error("UPLOAD_USER_DOC", err);
            throw err;
        }
    }

    async function deleteUserDoc(id: string): Promise<void> {
        try {
            await deleteDocument(id);
            await loadUserDocs({ reload: true });
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
