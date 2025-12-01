import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { DocumentStatuses, IDocument } from "../../services/api/DTO/documents";

export const useUserDocuments = defineStore("userDocuments", () => {
    const documents = ref<IDocument[]>([]);

    const getHasNotApprovedDoc = computed<boolean>(() => {
        return documents.value.some((doc) => {
            return doc.status === DocumentStatuses.NotApproved;
        });
    });

    function setDocuments(docs: IDocument[]) {
        documents.value = docs;
    }

    return {
        documents,
        getHasNotApprovedDoc,
        setDocuments,
    };
});
