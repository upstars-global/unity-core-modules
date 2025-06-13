import { excludeNotificationTitles } from "@config/gift";
import { ENABLED_NOTICES_USER_GROUP_IDS } from "@config/user-statuses";
import { eventsHandlers } from "@helpers/generateNotifications";
import { defineStore, storeToRefs } from "pinia";
import { v4 as uuid } from "uuid";
import { computed, ref } from "vue";

import { IndexedDBEvents } from "../controllers/indexedDB/consts";
import { useNotificationDB } from "../controllers/indexedDB/notificationsDB";
import { isServer } from "../helpers/ssrHelpers";
import type { UserGroup } from "../models/user";
import type {
    IConfigNotice,
    INotification,
} from "../models/WSnotices";
import {
    WSBettingNotificationName,
    WSNotificationName,
} from "../models/WSnotices";
import { GiftState } from "../services/api/DTO/gifts";
import { useUserStatuses } from "./user/userStatuses";

const { notificationDB } = useNotificationDB();

export const useNoticesStore = defineStore("notices", () => {
    const { getUserGroups } = storeToRefs(useUserStatuses());

    const headerNotices = ref<IConfigNotice[]>([]);
    const notifications = ref<INotification[]>([]);

    const enabledNotices = computed(() => {
        return getUserGroups.value.some((group: UserGroup) => {
            return ENABLED_NOTICES_USER_GROUP_IDS.includes(Number(group));
        });
    });

    if (!isServer) {
        notificationDB?.getAllData().then((data) => {
            notifications.value = data || [];
        });
        if (notificationDB?.eventTarget.addEventListener) {
            notificationDB?.eventTarget
                .addEventListener(IndexedDBEvents.deleteData, () => {
                    notificationDB?.getAllData().then((data) => {
                        notifications.value = data || [];
                    });
                });
        }
    }

    function addHeaderNoticeConfig(noticeConfig: IConfigNotice): void {
        const newState = headerNotices.value.filter(({ id }) => {
            return id !== noticeConfig.id;
        });
        headerNotices.value = [ ...newState, noticeConfig ];
    }

    function deleteHeaderNotice(idNotice: string): void {
        const newState = headerNotices.value.filter(({ id }) => {
            return id !== idNotice;
        });
        headerNotices.value = [ ...newState ];
    }

    function addRealTimeNotification({ data }, type: WSNotificationName | WSBettingNotificationName): void {
        if (eventsHandlers[type]) {
            const hasExcludedTitle = excludeNotificationTitles.some((title: string) => data.title.includes(title));
            if (hasExcludedTitle) {
                return;
            }

            if (
                data.stage !== GiftState.issued &&
                [ WSNotificationName.BONUSES_CHANGES, WSNotificationName.FREESPINS_CHANGES ].includes(type)
            ) {
                return;
            }

            const dataWithId = {
                id: uuid(),
                ...data,
            };

            notifications.value = [ ...notifications.value, { ...dataWithId, type } ];
            notificationDB?.saveData(dataWithId.id, { ...data, type });
        }
    }

    const getAllNotifications = computed(() => {
        return notifications.value.map((notice: INotification) => {
            if (eventsHandlers[notice.type]) {
                return eventsHandlers[notice.type](notice);
            }
        }).filter((item) => item);
    });

    function deleteNotification(noticeId: string): void {
        notifications.value = notifications.value.filter(({ id }) => {
            return id !== noticeId;
        });
        notificationDB?.deleteData(noticeId);
    }

    function clearUserNotification() {
        notifications.value = [];
        notificationDB?.clearAllData();
    }

    return {
        enabledNotices,

        headerNotices,
        notifications,
        getAllNotifications,

        addHeaderNoticeConfig,
        deleteHeaderNotice,

        addRealTimeNotification,
        deleteNotification,
        clearUserNotification,
    };
});
