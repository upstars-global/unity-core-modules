import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";

import { type ITwoFactorAuthData, type IUserSession } from "../../models/user";
import { useCommon } from "../common";
import { useUserInfo } from "./userInfo";

export type GdprReportStatus = "idle" | "loading" | "created" | "already_requested" | "error";

interface GdprReportState {
    status: GdprReportStatus;
}

export const useUserSecurity = defineStore("userSecurity", () => {
    const commonStore = useCommon();
    const userInfo = useUserInfo();
    const userActiveSessions = ref<IUserSession[]>([]);
    const twoFactorData = ref<ITwoFactorAuthData>({} as ITwoFactorAuthData);
    const gdprReport = ref<GdprReportState>({ status: "idle" });
    const isGdprReportLoading = computed(() => gdprReport.value.status === "loading");
    const isGdprReportAlreadyRequested = computed(() => gdprReport.value.status === "already_requested");
    const isGdprReportRequested = computed(() =>
        gdprReport.value.status === "created" || isGdprReportAlreadyRequested.value,
    );
    const canRequestGdprReport = computed(() =>
        commonStore.isGdprReportEnabled && !isGdprReportLoading.value && !isGdprReportRequested.value,
    );

    function setGdprReportStatus(status: GdprReportStatus) {
        gdprReport.value = { status };
    }

    function startGdprReportRequest() {
        if (!canRequestGdprReport.value) {
            return;
        }

        setGdprReportStatus("loading");
        return gdprReport.value;
    }

    function completeGdprReportRequest(request: GdprReportState, status: GdprReportStatus) {
        if (gdprReport.value === request) {
            setGdprReportStatus(status);
        }
    }

    watch(() => userInfo.getUserInfo.id, () => setGdprReportStatus("idle"), { flush: "sync" });

    function setUserActiveSessions(sessions: IUserSession[]) {
        userActiveSessions.value = sessions;
    }

    function setTwoFactorData(data: ITwoFactorAuthData) {
        twoFactorData.value = data;
    }

    return {
        userActiveSessions,
        setUserActiveSessions,
        twoFactorData,
        setTwoFactorData,
        gdprReport,
        isGdprReportLoading,
        isGdprReportRequested,
        isGdprReportAlreadyRequested,
        startGdprReportRequest,
        completeGdprReportRequest,
    };
});
