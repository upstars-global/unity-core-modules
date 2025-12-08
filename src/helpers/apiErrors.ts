export type ApiError = {
    response?: {
        data?: unknown;
    };
};

export const isApiError = (error: unknown): error is ApiError => {
    return typeof error === "object" && error !== null && "response" in error;
};
