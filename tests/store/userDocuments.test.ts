import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";

import {
    DocumentStatuses,
    DocumentType,
    type IDocument,
} from "../../src/services/api/DTO/documents";
import { useUserDocuments } from "../../src/store/user/userDocuments";

const createDocument = (overrides: Partial<IDocument> = {}): IDocument => ({
    id: 1,
    description: null,
    document_type: DocumentType.Identity,
    status: DocumentStatuses.NotApproved,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
    file_name: "identity.jpg",
    ...overrides,
});

describe("useUserDocuments store", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it("initializes with empty documents list and no pending approval", () => {
        const store = useUserDocuments();

        expect(store.documents).toEqual([]);
        expect(store.getHasNotApprovedDoc).toBe(false);
    });

    it("getHasNotApprovedDoc becomes true when a document is not approved", () => {
        const store = useUserDocuments();
        const docs = [
            createDocument({ id: 10 }),
            createDocument({ id: 11, document_type: DocumentType.Address }),
        ];

        store.setDocuments(docs);

        expect(store.documents).toEqual(docs);
        expect(store.getHasNotApprovedDoc).toBe(true);
    });

    it("getHasNotApprovedDoc resets to false when all documents are approved", () => {
        const store = useUserDocuments();
        store.setDocuments([
            createDocument({ id: 1 }),
            createDocument({ id: 2 }),
        ]);
        const approvedDocs = [
            createDocument({
                id: 3,
                status: "approved" as DocumentStatuses,
            }),
        ];

        store.setDocuments(approvedDocs);

        expect(store.documents).toEqual(approvedDocs);
        expect(store.getHasNotApprovedDoc).toBe(false);
    });
});
