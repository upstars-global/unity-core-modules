export enum DocumentType {
    Identity = "identity",
    Address = "address",
    Deposit = "deposit",
    PaymentMethod = "payment_method",
}

export enum DocumentStatuses {
    NotApproved = "not_approved",
}

export interface IDocument {
    id: number;
    description: string | null;
    document_type: DocumentType;
    status: DocumentStatuses;
    created_at: "string";
    updated_at: "string";
    file_name: "string";
}
