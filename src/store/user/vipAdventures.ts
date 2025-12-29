import { formatDateVipAdv, VIP_ADV_GROUP } from "@config/vip-adventures";
import dayjs from "dayjs";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { type Currencies } from "../../models/enums/currencies";
import type { IUserStatus, UserGroup } from "../../models/user";
import type { IVipAdventuresDayConfig } from "../../models/vipAdventures";
import type { IPrizeConfigItem, IVipProgress } from "../../services/api/DTO/vipAdventuresDTO";
import { useEnvironments } from "../../store/environments";
import { useUserStatuses } from "./userStatuses";

const USER_INCLUDES_ADVENTURES = {
    [VIP_ADV_GROUP]: "vip_adv",
};

function prepareVipAdventureCollectionDays(configDays: IPrizeConfigItem[], userStatuses: IUserStatus[]): IVipAdventuresDayConfig[] {
    return configDays.map((configDayItem) => {
        const { day, step, stepTotal } = parseAdventuresTitleDayConfig(configDayItem.title);
        return {
            day,
            step,
            stepTotal,
            isCompleted: userStatuses.some(({ name }) => name === configDayItem.title),
            ...configDayItem,
        };
    });
}


export function parseAdventuresTitleDayConfig(title: string): {
    day: string;
    step: number;
    stepTotal: number;
} {
    const [ __, stepInfo, day ] = title.split("__");
    const [ step, stepTotal ] = stepInfo.split("/");
    return {
        day,
        step: Number(step),
        stepTotal: Number(stepTotal),
    };
}

export function parseGiftAdventureTitle(title: string): {
    step: number;
    giftTitle: string;
    day: string
} | string {
    if (title.includes("__")) {
        const [ __, step, day, giftTitle ] = title.split("__");
        return {
            step: Number(step),
            day,
            giftTitle,
        };
    }

    return title;
}
export const useVipAdventures = defineStore("vipAdventures", () => {
    const userStatuses = useUserStatuses();
    const vipAdventuresConfigFile = ref<IPrizeConfigItem[]>();
    const vipAdventuresVariables = ref<Record<string, Record<Currencies, string>>>({});
    const userVipStatusProgress = ref<IVipProgress>();

    const toDay = computed(() => {
        const { useMocker } = useEnvironments();

        const dayMocker = parseAdventuresTitleDayConfig(vipAdventuresConfigFile.value?.[2]?.title || "__")?.day;
        return useMocker && dayMocker ?
            dayjs(dayMocker, formatDateVipAdv) :
            dayjs().utc();
    });

    const calendarConfig = computed(() => {
        if (!vipAdventuresConfigFile.value) {
            return [];
        }

        return vipAdventuresConfigFile.value.map((item, index) => {
            const { day } = parseAdventuresTitleDayConfig(item.title);
            const date = dayjs(day, formatDateVipAdv);

            return {
                index,
                fullDate: day,
                day: date.date(),
                weekday: date.weekday(),
                month: date.month(),
                today: toDay.value.format(formatDateVipAdv) === day,
                isCompleted: userStatuses.getUserStatuses.some(({ name }) => name === item.title),
            };
        });
    });
    const superConfig = computed(() => {
        const calendarLength = calendarConfig.value.length;
        const lastCalendarDay = calendarConfig.value[calendarLength - 1];
        return {
            index: calendarConfig.value.length,
            today: dayjs(lastCalendarDay.fullDate, formatDateVipAdv).isBefore(toDay.value),
        };
    });

    const vipAdventuresDays = computed<IVipAdventuresDayConfig[]>(() => {
        if (!vipAdventuresConfigFile.value) {
            return [];
        }
        return prepareVipAdventureCollectionDays(vipAdventuresConfigFile.value, userStatuses.getUserStatuses);
    });
    const superDay = computed<IVipAdventuresDayConfig | void>(() => {
        if (!vipAdventuresConfigFile.value) {
            return;
        }

        const calendarLength = vipAdventuresDays.value.length;
        const lastCalendarDay = vipAdventuresDays.value[calendarLength - 1];

        return {
            ...lastCalendarDay,
            day: dayjs(lastCalendarDay.day, formatDateVipAdv).add(1, "day").format(formatDateVipAdv),
            step: lastCalendarDay.step + 1,
        };
    });

    const userGroupForAdventure = computed<UserGroup | undefined>(() => {
        return userStatuses.getUserGroups.find((userGroupItem) => USER_INCLUDES_ADVENTURES[userGroupItem]);
    });

    return {
        vipAdventuresConfigFile,
        vipAdventuresVariables,

        vipAdventuresDays,
        superDay,
        userVipStatusProgress,
        userGroupForAdventure,

        calendarConfig,
        superConfig,
        toDay,
    };
});
