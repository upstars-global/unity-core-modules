import { defineStore } from "pinia";
import { computed, ref } from "vue";

export interface SumsubReviewResult {
    reviewAnswer: string;
    moderationComment?: string;
    clientComment?: string;
    rejectLabels?: string[];
    reviewRejectType?: string;
}

export interface SumsubDocsStepStatus {
    reviewResult?: {
        reviewAnswer: string;
        moderationComment?: string;
        reviewRejectType?: string;
    };
    country?: string | null;
    idDocType?: string | null;
    imageIds?: number[];
}

export interface SumsubVerificationStatus {
    applicantId: string | null;
    reviewStatus: string;
    reviewResult: SumsubReviewResult | null;
    docsStatus: Record<string, SumsubDocsStepStatus> | null;
}

export const useUserVerificationSumsub = defineStore("UserVerificationSumsub", () => {
    const accessToken = ref<string>("");
    const verificationStatus = ref<SumsubVerificationStatus | null>(null);
    const isStatusLoading = ref<boolean>(false);
    const statusError = ref<string | null>(null);

    function setAccessToken(token: string) {
        accessToken.value = token;
    }

    function setVerificationStatus(status: SumsubVerificationStatus) {
        verificationStatus.value = status;
        statusError.value = null;
    }

    function setStatusLoading(loading: boolean) {
        isStatusLoading.value = loading;
    }

    function setStatusError(error: string) {
        statusError.value = error;
    }

    function clearVerificationStatus() {
        verificationStatus.value = null;
        statusError.value = null;
    }

    const getReviewStatus = computed(() => verificationStatus.value?.reviewStatus ?? null);

    const getReviewResult = computed(() => verificationStatus.value?.reviewResult ?? null);

    const getDocsStatus = computed(() => verificationStatus.value?.docsStatus ?? null);

    const isPending = computed(() => {
        const status = getReviewStatus.value;
        return status === "pending" || status === "queued" || status === "prechecked";
    });

    const isRejected = computed(() => {
        return getReviewStatus.value === "completed" &&
            getReviewResult.value?.reviewAnswer === "RED";
    });

    const isApproved = computed(() => {
        return getReviewStatus.value === "completed" &&
            getReviewResult.value?.reviewAnswer === "GREEN";
    });

    const canRetry = computed(() => {
        return isRejected.value &&
            getReviewResult.value?.reviewRejectType === "RETRY";
    });

    const isFinalReject = computed(() => {
        return isRejected.value &&
            getReviewResult.value?.reviewRejectType === "FINAL";
    });

    const getModerationComment = computed(() => {
        return getReviewResult.value?.moderationComment ?? null;
    });

    return {
        accessToken,
        setAccessToken,
        verificationStatus,
        isStatusLoading,
        statusError,
        setVerificationStatus,
        setStatusLoading,
        setStatusError,
        clearVerificationStatus,
        getReviewStatus,
        getReviewResult,
        getDocsStatus,
        isPending,
        isRejected,
        isApproved,
        canRetry,
        isFinalReject,
        getModerationComment,
    };
});
